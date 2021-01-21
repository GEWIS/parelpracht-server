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

function rangeToArray(start: number, end: number, step: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

export default class StatisticsService {
  async getDashboardProductInstanceStatistics(year: number):
  Promise<DashboardProductInstanceStats> {
    console.log(year);

    const firstYear: Promise<any> = createQueryBuilder('contract', 'c').select('c.createdAt').orderBy('c.createdAt', 'ASC').getOne();

    const responses = await Promise.all([
      RawQueries.getTotalSuggestedAmountByFinancialYear(year),
      RawQueries.getTotalSignedAmountByFinancialYear(year),
      RawQueries.getTotalDeliveredAmountByFinancialYear(year),
      RawQueries.getTotalNonDeliveredProductsInvoicedAmountByFinancialYear(year),
      RawQueries.getTotalDeliveredProductsInvoicedAmountByFinancialYear(year),
      RawQueries.getTotalInvoicesPaidAmountByFinancialYear(year),
      firstYear,
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
      financialYears: rangeToArray(
        dateToFinancialYear(responses[6].createdAt), dateToFinancialYear(new Date()), 1,
      ),
    } as any as DashboardProductInstanceStats;
    return result;
  }
}
