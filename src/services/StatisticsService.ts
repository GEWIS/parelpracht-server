import { createQueryBuilder } from 'typeorm';
import RawQueries, { AnalysisResult } from '../helpers/rawQueries';
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

export interface ContractedProductsPerMonth {
  categories: ProductsPerCategory[];
  financialYears: number[];
}

function rangeToArray(start: number, end: number, step: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

export default class StatisticsService {
  private async getFinancialYears(): Promise<number[]> {
    const firstYear = await createQueryBuilder('contract', 'c').select('c.createdAt').orderBy('c.createdAt', 'ASC').getOne();
    let start: Date;
    if (firstYear) { // @ts-ignore
      start = firstYear.createdAt;
    } else {
      start = new Date();
    }
    return rangeToArray(dateToFinancialYear(start), dateToFinancialYear(new Date()), 1);
  }

  async getDashboardProductInstanceStatistics(year: number):
  Promise<DashboardProductInstanceStats> {
    const responses = await Promise.all([
      RawQueries.getTotalSuggestedAmountByFinancialYear(year),
      RawQueries.getTotalSignedAmountByFinancialYear(year),
      RawQueries.getTotalDeliveredAmountByFinancialYear(year),
      RawQueries.getTotalNonDeliveredProductsInvoicedAmountByFinancialYear(year),
      RawQueries.getTotalDeliveredProductsInvoicedAmountByFinancialYear(year),
      RawQueries.getTotalInvoicesPaidAmountByFinancialYear(year),
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

  async getProductContractedPerMonth(year: number): Promise<ContractedProductsPerMonth> {
    const q = await RawQueries.getProductsContractedPerMonthByFinancialYear(year);

    const result: ProductsPerCategory[] = [];
    let tempRes: ProductsPerCategory = {
      categoryId: -1,
      amount: [],
      nrOfProducts: [],
    };
    let categoryId: number;

    const finishProductCategoryParsing = () => {
      // Append arrays with zeroes until we get a length of 12 (months)
      while (tempRes.amount.length <= 12) {
        tempRes.amount.push(0);
        tempRes.nrOfProducts.push(0);
      }

      // Make the arrays cumulative
      for (let i = 1; i <= 12; i++) {
        tempRes.amount[i] += tempRes.amount[i - 1];
        tempRes.nrOfProducts[i] += tempRes.nrOfProducts[i - 1];
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

      while (tempRes.amount.length < p.month) {
        tempRes.amount.push(0);
        tempRes.nrOfProducts.push(0);
      }
      tempRes.amount.push(parseInt(p.amount.toString(), 10));
      tempRes.nrOfProducts.push(parseInt(p.nrOfProducts.toString(), 10));
    });
    finishProductCategoryParsing();

    return {
      categories: result,
      financialYears: await this.getFinancialYears(),
    };
  }
}
