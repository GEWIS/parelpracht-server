import { InvoiceStatus } from './enums/InvoiceStatus';
import { ContractStatus } from './enums/ContractStatus';

export interface ContractSummary {
  id: number;
  title: string;
  value: number;
  status: ContractStatus;
}

export interface InvoiceSummary {
  id: number;
  title: string;
  companyId: number;
  value: number;
  status: InvoiceStatus;
}
