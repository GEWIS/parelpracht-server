import { User } from '../entity/User';
import { Contact } from '../entity/Contact';
import { Language } from '../entity/enums/Language';
import { VAT } from '../entity/enums/ValueAddedTax';

export enum ContractType {
  CONTRACT = 'CONTRACT',
  PROPOSAL = 'PROPOSAL',
}

export enum ReturnFileType {
  PDF = 'PDF',
  TEX = 'TEX',
}

export interface ContractGenSettings {
  language: Language,
  contentType: ContractType,
  fileType: ReturnFileType,
  saveToDisk: boolean,
  showDiscountPercentages: boolean,
  signee1?: User,
  signee2?: User,
  sender: User,
  recipient: Contact,
}

export interface InvoiceGenSettings {
  language: Language,
  fileType: ReturnFileType,
  saveToDisk: boolean,
  showDiscountPercentages: boolean;
  sender: User,
  recipient: Contact,
}

interface CustomRecipient {
  number: string,
  name: string,
  organizationName?: string,
  street?: string,
  postalCode?: string,
  city?: string,
  country?: string,
}

interface CustomProduct {
  name: string,
  amount: number,
  pricePerOne: number,
  valueAddedTax: VAT,
}

export interface CustomInvoiceGenSettings {
  language: Language,
  fileType: ReturnFileType,
  recipient: CustomRecipient,
  subject: string,
  ourReference: string,
  theirReference?: string,
  products: CustomProduct[],
  date: Date,
}
