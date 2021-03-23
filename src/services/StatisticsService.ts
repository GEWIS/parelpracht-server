import { createQueryBuilder } from 'typeorm';
import RawQueries, {
  AnalysisResult,
  AnalysisResultByYear,
  ProductsPerCategoryPerPeriod,
} from '../helpers/rawQueries';
import { dateToFinancialYear } from '../helpers/timestamp';

export interface DashboardProductInstanceStats {
  suggested: AnalysisResult;
  contracted: AnalysisResult;
  delivered: AnalysisResult;
  invoiced: InvoicedAmounts;
  paid: AnalysisResult;
  financialYears: number[];
}

interface InvoicedAmounts {
  delivered: AnalysisResult;
  notDelivered: AnalysisResult;
}

interface ProductsPerCategory {
  categoryId: number;
  amount: number[];
  nrOfProducts: number[];
}

export interface ContractedProductsAnalysis {
  categories: ProductsPerCategory[];
  labels?: string[];
  financialYears?: number[];
}

function rangeToArray(start: number, end: number, step: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

function appendZeroesToStart(array: number[], newLength: number) {
  while (array.length < newLength) {
    array.splice(0, 0, 0);
  }
  return array;
}

export default class StatisticsService {
  public async getFinancialYears(firstYear?: number): Promise<number[]> {
    if (firstYear) return rangeToArray(firstYear, dateToFinancialYear(new Date()), 1);

    const startYear = await createQueryBuilder('contract', 'c').select('c.createdAt').orderBy('c.createdAt', 'ASC').getOne();
    let start: Date;
    if (startYear) { // @ts-ignore
      start = startYear.createdAt;
    } else {
      start = new Date();
    }
    return rangeToArray(dateToFinancialYear(start), dateToFinancialYear(new Date()), 1);
  }

  async getDashboardProductInstanceStatistics(year: number):
  Promise<DashboardProductInstanceStats> {
    const rawQueries = new RawQueries();
    const responses = await Promise.all([
      rawQueries.getTotalSuggestedAmountByFinancialYear(year),
      rawQueries.getTotalSignedAmountByFinancialYear(year),
      rawQueries.getTotalDeliveredAmountByFinancialYear(year),
      rawQueries.getTotalNonDeliveredProductsInvoicedAmountByFinancialYear(year),
      rawQueries.getTotalDeliveredProductsInvoicedAmountByFinancialYear(year),
      rawQueries.getTotalInvoicesPaidAmountByFinancialYear(year),
      this.getFinancialYears(),
    ]);

    // Because Typescript/Javascript is stupid and actually returns strings instead of integers,
    // we need to manually convert all values to integers. How fun
    const result = {
      suggested: {
        amount: parseInt(responses[0][0].amount.toString(), 10),
        nrOfProducts: parseInt(responses[0][0].nrOfProducts.toString(), 10),
      },
      contracted: {
        amount: parseInt(responses[1][0].amount.toString(), 10),
        nrOfProducts: parseInt(responses[1][0].nrOfProducts.toString(), 10),
      },
      delivered: {
        amount: parseInt(responses[2][0].amount.toString(), 10),
        nrOfProducts: parseInt(responses[2][0].nrOfProducts.toString(), 10),
      },
      invoiced: {
        notDelivered: {
          amount: parseInt(responses[3][0].amount.toString(), 10),
          nrOfProducts: parseInt(responses[3][0].nrOfProducts.toString(), 10),
        },
        delivered: {
          amount: parseInt(responses[4][0].amount.toString(), 10),
          nrOfProducts: parseInt(responses[4][0].nrOfProducts.toString(), 10),
        },
      },
      paid: {
        amount: parseInt(responses[5][0].amount.toString(), 10),
        nrOfProducts: parseInt(responses[5][0].nrOfProducts.toString(), 10),
      },
      financialYears: responses[6],
    } as any as DashboardProductInstanceStats;
    return result;
  }

  parseContractedProductsPerPeriod(
    q: ProductsPerCategoryPerPeriod[], cumulative: boolean, length: number, lowestNumber: number,
  ): ProductsPerCategory[] {
    const result: ProductsPerCategory[] = [];
    let tempRes: ProductsPerCategory = {
      categoryId: -1,
      amount: [],
      nrOfProducts: [],
    };
    let categoryId: number;

    const finishProductCategoryParsing = () => {
      // Append arrays with zeroes until we get a length of 12 (months)
      while (tempRes.amount.length <= length) {
        tempRes.amount.push(0);
        tempRes.nrOfProducts.push(0);
      }

      if (cumulative) {
        // Make the arrays cumulative
        for (let i = 1; i <= length; i++) {
          tempRes.amount[i] += tempRes.amount[i - 1];
          tempRes.nrOfProducts[i] += tempRes.nrOfProducts[i - 1];
        }
      }

      result.push(tempRes);
    };

    q.forEach((p) => {
      categoryId = parseInt(p.categoryId.toString(), 10);

      // If this is a new categoryId, we have seen all categories with the previous ID
      if (tempRes.categoryId !== categoryId) {
        if (tempRes.categoryId >= 0) {
          finishProductCategoryParsing();
        }
        tempRes = {
          categoryId,
          amount: [],
          nrOfProducts: [],
        };
      }

      while (tempRes.amount.length < p.period - lowestNumber) {
        tempRes.amount.push(0);
        tempRes.nrOfProducts.push(0);
      }
      tempRes.amount.push(parseInt(p.amount.toString(), 10));
      tempRes.nrOfProducts.push(parseInt(p.nrOfProducts.toString(), 10));
    });
    finishProductCategoryParsing();

    return result;
  }

  async getProductContractedPerMonth(year: number): Promise<ContractedProductsAnalysis> {
    const q = await new RawQueries().getProductsContractedPerMonthByFinancialYear(year);

    return {
      categories: this.parseContractedProductsPerPeriod(q, true, 12, 0),
      financialYears: await this.getFinancialYears(),
    };
  }

  async getCompanyStatistics(id: number): Promise<ContractedProductsAnalysis> {
    const q = await new RawQueries().getProductsContractedPerFinancialYearByCompany(id);
    const parsedQ = this.parseContractedProductsPerPeriod(
      q, false, 10, dateToFinancialYear(new Date()) - 10,
    );

    return {
      categories: parsedQ,
      labels: (await this.getFinancialYears(dateToFinancialYear(new Date()) - 10))
        .map((i) => i.toString()),
    };
  }

  async getProductsContractedByFinancialYear(id: number): Promise<AnalysisResultByYear[]> {
    const result = await new RawQueries().getProductInstancesByFinancialYear(id);
    if (result.length === 0) return result;

    for (let i = 1; i < result.length; i++) {
      if (result[i].year - 1 !== result[i - 1].year) {
        result.splice(i, 0, {
          amount: 0,
          nrOfProducts: 0,
          year: result[0].year + i,
        } as any as AnalysisResultByYear);
      }
    }

    return result.sort((a, b) => a.year - b.year);
  }
}
