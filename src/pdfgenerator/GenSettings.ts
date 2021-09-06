import { User } from '../entity/User';
import { Contact } from '../entity/Contact';
import { Gender } from '../entity/enums/Gender';
import { Language } from '../entity/enums/Language';

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
  name: string,
  gender: Gender,
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
}

export interface CustomInvoiceGenSettings {
  language: Language,
  fileType: ReturnFileType,
  recipient: CustomRecipient,
  subject: string,
  invoiceReason: string,
  ourReference: string,
  theirReference?: string,
  products: CustomProduct[],
  date: Date,
}
