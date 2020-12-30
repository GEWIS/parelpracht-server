import { User } from '../entity/User';
import { Contact } from '../entity/Contact';

export enum Language {
  DUTCH = 'DUTCH',
  ENGLISH = 'ENGLISH',
}

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
  signee1: User,
  signee2: User,
  sender: User,
}

export interface InvoiceGenSettings {
  language: Language,
  fileType: ReturnFileType,
  saveToDisk: boolean,
  sender: User,
  recipient: Contact,
}
