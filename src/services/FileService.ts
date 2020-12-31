import { getRepository, Repository } from 'typeorm';
import * as fs from 'fs';
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import mime from 'mime';
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
import FileHelper, { uploadDirLoc } from '../helpers/fileHelper';
import { ProductFile } from '../entity/file/ProductFile';
import ContactService from './ContactService';
import { User } from '../entity/User';

export interface FileParams {
  name: string;
}

export interface FullFileParams extends FileParams {
  entityId: number;
}

export interface GenerateContractParams extends FileParams {
  language: Language,
  contentType: ContractType,
  fileType: ReturnFileType,
  showDiscountPercentages: boolean,
  saveToDisk: boolean,
  signee1Id: number,
  signee2Id: number,
}
export interface FullGenerateContractParams extends FullFileParams, GenerateContractParams {}

export interface GenerateInvoiceParams extends FileParams {
  language: Language,
  fileType: ReturnFileType,
  showDiscountPercentages: boolean,
  saveToDisk: boolean,
  recipientId: number,
}
export interface FullGenerateInvoiceParams extends FullFileParams, GenerateInvoiceParams {}

export default class FileService {
  repo: Repository<BaseFile>;

  /** Represents the logged in user, performing an operation */
  actor?: User;

  /** Child class of BaseFile */
  EntityFile: typeof BaseFile;

  constructor(EntityFile: typeof BaseFile, options?: { actor?: User }) {
    this.EntityFile = EntityFile;
    this.repo = getRepository(EntityFile);
    this.actor = options?.actor;
  }

  validateFileObject(file: any, entityId: number, checkFileExistence?: boolean): any {
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
      case ProductFile:
        if (file.productId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this product'); }
        break;
      default:
        throw new TypeError(`Type ${this.EntityFile.constructor.name} is not a valid entity file`);
    }

    if (checkFileExistence && !fs.existsSync(file.location)) {
      // The file does not exist on disk anymore, so this file object is useless.
      // Better to just delete this FileObject as well.
      this.repo.delete(file!.id);
      throw new ApiError(HTTPStatus.NoContent, 'File does not exist on disk. File object has been deleted');
    }

    return file;
  }

  async generateContractFile(params: FullGenerateContractParams): Promise<ContractFile> {
    const file = await this.createFileObject(params);
    const p = {
      ...params,
      signee1: await new UserService().getUser(params.signee1Id),
      signee2: await new UserService().getUser(params.signee2Id),
      sender: this.actor,
    } as any as ContractGenSettings;

    const contract = await new ContractService().getContract(params.entityId, ['products.product']);
    if (contract.products.length === 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Contract does not have any products');
    }

    file.location = await new PdfGenerator().generateContract(contract, p);
    file.downloadName = `C${file.contractId} ${file.name}.${FileHelper.fileLocationToExtension(file.location)}`;

    if (params.saveToDisk) {
      try {
        await this.saveFileObject(file);
      } catch (err) {
        FileHelper.removeFile(file);
        throw new Error(err);
      }
    }

    return file;
  }

  async generateInvoiceFile(params: FullGenerateInvoiceParams): Promise<InvoiceFile> {
    const file = await this.createFileObject(params);
    const p = {
      ...params,
      recipient: await new ContactService().getContact(params.recipientId),
      sender: this.actor,
    } as any as InvoiceGenSettings;

    const invoice = await new InvoiceService().getInvoice(params.entityId, ['products.product']);
    if (invoice.products.length === 0) {
      throw new ApiError(HTTPStatus.BadRequest, 'Invoice does not have any products');
    }

    file.location = await new PdfGenerator().generateInvoice(invoice, p);
    file.downloadName = `F${file.invoiceId} ${file.name}.${FileHelper.fileLocationToExtension(file.location)}`;

    if (params.saveToDisk) {
      try {
        await this.saveFileObject(file);
      } catch (err) {
        FileHelper.removeFile(file);
        throw new Error(err);
      }
    }

    return file;
  }

  private handleFile(request: express.Request): Promise<void> {
    const multerSingle = multer().single('file');
    return new Promise((resolve, reject) => {
      // @ts-ignore
      multerSingle(request, undefined, async (error: Error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  async uploadFile(request: express.Request, entityId: number) {
    await this.handleFile(request);
    const params = {
      name: request.body.name,
      entityId,
    } as FullFileParams;
    let file = await this.createFileObject(params);

    const randomFileName = `${uuidv4()}.${mime.getExtension(request.file.mimetype)}`;
    file.location = path.join(__dirname, '/../../', uploadDirLoc, randomFileName);
    fs.writeFileSync(file.location, request.file.buffer);
    file.downloadName = request.file.originalname;

    try {
      file = this.repo.save(file);
    } catch (err) {
      FileHelper.removeFile(file);
      throw new Error(err);
    }

    return file;
  }

  async saveFileObject(file: BaseFile): Promise<BaseFile> {
    return this.repo.save(file);
  }

  async createFileObject(params: FullFileParams) {
    // @ts-ignore
    let file = new this.EntityFile();
    file = {
      ...file,
      name: params.name,
      createdBy: this.actor,
      location: '',
    };

    switch (this.EntityFile) {
      case ContractFile:
        file.contractId = params.entityId;
        break;
      case InvoiceFile:
        file.invoiceId = params.entityId;
        break;
      case ProductFile:
        file.productId = params.entityId;
        break;
      default:
        throw new TypeError(`Type ${this.EntityFile.constructor.name} is not a valid entity file`);
    }

    return file;
  }

  async getFile(entityId: number, fileId: number) {
    let file = await this.repo.findOne(fileId);
    file = this.validateFileObject(file, entityId);
    return file!;
  }

  async updateFile(
    entityId: number, fileId: number, params: Partial<FileParams>,
  ): Promise<BaseFile> {
    let file = await this.repo.findOne(fileId);
    file = this.validateFileObject(file, entityId);
    await this.repo.update(file!.id, params);

    file = await this.repo.findOne(fileId);
    return file!;
  }

  async deleteFile(entityId: number, fileId: number, disk: boolean): Promise<void> {
    let file = await this.repo.findOne(fileId);
    file = this.validateFileObject(file, entityId, false);

    if (disk) FileHelper.removeFile(file!);

    await this.repo.delete(file!.id);
  }
}
