import { getRepository, Repository } from 'typeorm';
import BaseFile from '../entity/file/BaseFile';
import UserService from './UserService';
import { ContractFile } from '../entity/file/ContractFile';
import { InvoiceFile } from '../entity/file/InvoiceFile';
import { ApiError, HTTPStatus } from '../helpers/error';
import {
  ContractGenSettings,
  ContractType,
  InvoiceGenSettings,
  Language,
  ReturnFileType,
} from '../pdfgenerator/GenSettings';
import PdfGenerator from '../pdfgenerator/PdfGenerator';
import InvoiceService from './InvoiceService';
import ContractService from './ContractService';

export interface UpdateFileParams {
  name: string;
}

export interface FileParams extends UpdateFileParams {
  createdById: number;
}

export interface FullFileParams extends FileParams {
  entityId: number;
}

export interface GenerateContractParams extends FileParams {
  language: Language,
  contentType: ContractType,
  fileType: ReturnFileType,
  saveToDisk: boolean,
  signee1Id: number,
  signee2Id: number,
}
export interface FullGenerateContractParams extends FullFileParams, GenerateContractParams {}

export interface GenerateInvoiceParams extends FileParams {
  language: Language,
  fileType: ReturnFileType,
  saveToDisk: boolean,
  recipientId: number,
}
export interface FullGenerateInvoiceParams extends FullFileParams, GenerateInvoiceParams {}

export default class FileService {
  repo: Repository<BaseFile>;

  EntityFile: typeof BaseFile;

  constructor(EntityFile: typeof BaseFile) {
    this.EntityFile = EntityFile;
    this.repo = getRepository(EntityFile);
  }

  validateFileObject(file: any, entityId: number): any {
    if (file === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'File not found');
    }
    switch (this.EntityFile) {
      case ContractFile:
        if (file.contractId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this contract'); }
        break;
      case InvoiceFile:
        if (file.invoiceId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this invoice'); }
        break;
      default:
        throw new TypeError(`Type ${this.EntityFile.constructor.name} is not a valid entity file`);
    }

    return file;
  }

  async generateContractFile(params: FullGenerateContractParams) {
    const file = await this.createFileObject(params);
    const p = {
      ...params,
      signee1: await new UserService().getUser(params.signee1Id),
      signee2: await new UserService().getUser(params.signee2Id),
      sender: await new UserService().getUser(params.createdById),
    } as any as ContractGenSettings;

    const contract = await new ContractService().getContract(params.entityId, ['products.product']);
    file.location = await new PdfGenerator().generateContract(contract, p);

    return this.saveFileObject(file);
  }

  async generateInvoiceFile(params: FullGenerateInvoiceParams) {
    const file = await this.createFileObject(params);
    const p = {
      ...params,
      recipient: await new UserService().getUser(params.recipientId),
      sender: await new UserService().getUser(params.createdById),
    } as any as InvoiceGenSettings;

    const invoice = await new InvoiceService().getInvoice(params.entityId);
    file.location = await new PdfGenerator().generateInvoice(invoice, p);

    return this.saveFileObject(file);
  }

  async saveFileObject(file: BaseFile): Promise<BaseFile> {
    return this.repo.save(file);
  }

  async createFileObject(params: FullFileParams) {
    const user = await new UserService().getUser(params.createdById);
    // @ts-ignore
    let file = new this.EntityFile();
    file = {
      ...file,
      name: params.name,
      createdBy: user,
      location: '',
    };

    switch (this.EntityFile) {
      case ContractFile:
        file.contractId = params.entityId;
        break;
      case InvoiceFile:
        file.invoiceId = params.entityId;
        break;
      default:
        throw new TypeError(`Type ${this.EntityFile.constructor.name} is not a valid entity file`);
    }

    return file;
  }

  async updateFile(
    entityId: number, fileId: number, params: Partial<UpdateFileParams>,
  ): Promise<BaseFile> {
    let file = await this.repo.findOne(fileId);
    file = this.validateFileObject(file, entityId);
    await this.repo.update(file!.id, params);

    file = await this.repo.findOne(fileId);
    return file!;
  }

  async deleteFile(entityId: number, fileId: number): Promise<void> {
    let file = await this.repo.findOne(fileId);
    file = this.validateFileObject(file, entityId);
    await this.repo.delete(file!.id);
  }
}
