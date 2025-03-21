/* eslint-disable */
// TODO this file needs to be refactored with generics to be linted properly
import * as fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { Repository } from 'typeorm';
import mime from 'mime';
import BaseFile from '../entity/file/BaseFile';
import { ContractFile } from '../entity/file/ContractFile';
import { InvoiceFile } from '../entity/file/InvoiceFile';
import { ApiError, HTTPStatus } from '../helpers/error';
import {
  ContractGenSettings,
  ContractType,
  CustomInvoiceGenSettings,
  InvoiceGenSettings,
  ReturnFileType,
} from '../pdfgenerator/GenSettings';
import PdfGenerator from '../pdfgenerator/PdfGenerator';
import FileHelper, {
  uploadCompanyLogoDirLoc,
  uploadDirLoc,
  uploadUserAvatarDirLoc,
  uploadUserBackgroundDirLoc,
} from '../helpers/fileHelper';
import { ProductFile } from '../entity/file/ProductFile';
import { User } from '../entity/User';
import { validateFileParams } from '../helpers/validation';
import { CompanyFile } from '../entity/file/CompanyFile';
import { Language } from '../entity/enums/Language';
import AppDataSource from '../database';
import CompanyService from './CompanyService';
import ContactService from './ContactService';
import ContractService from './ContractService';
import InvoiceService from './InvoiceService';
import UserService from './UserService';
import { ExpressRequest } from '../types';

export interface FileParams {
  name?: string;
  createdAt?: Date;
}

export interface FullFileParams extends FileParams {
  entityId: number;
}

export interface GenerateContractParams extends FileParams {
  language: Language;
  contentType: ContractType;
  fileType: ReturnFileType;
  showDiscountPercentages: boolean;
  saveToDisk: boolean;
  signee1Id: number;
  signee2Id: number;
  recipientId: number;
}
export interface FullGenerateContractParams extends FullFileParams, GenerateContractParams {}

export interface GenerateInvoiceParams extends FileParams {
  language: Language;
  fileType: ReturnFileType;
  showDiscountPercentages: boolean;
  saveToDisk: boolean;
  recipientId: number;
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
    this.repo = AppDataSource.getRepository(EntityFile);
    this.actor = options?.actor;
  }

  validateFileObject(file: any, entityId: number, checkFileExistence?: boolean): any {
    if (file === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'File not found');
    }
    switch (this.EntityFile) {
      case ContractFile:
        if (file.contractId !== entityId) {
          throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this contract');
        }
        break;
      case InvoiceFile:
        if (file.invoiceId !== entityId) {
          throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this invoice');
        }
        break;
      case ProductFile:
        if (file.productId !== entityId) {
          throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this product');
        }
        break;
      case CompanyFile:
        if (file.companyId !== entityId) {
          throw new ApiError(HTTPStatus.BadRequest, 'File does not belong to this company');
        }
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
    const recipient = await new ContactService().getContact(params.recipientId);
    let signee1;
    let signee2;
    if (params.contentType === ContractType.CONTRACT) {
      signee1 = await new UserService().getUser(params.signee1Id);
      signee2 = await new UserService().getUser(params.signee2Id);

      if (!signee1.roles.map((r) => r.name).includes('SIGNEE')) {
        throw new ApiError(HTTPStatus.BadRequest, 'Signee 1 is not authorized to sign');
      }
      if (!signee2.roles.map((r) => r.name).includes('SIGNEE')) {
        throw new ApiError(HTTPStatus.BadRequest, 'Signee 2 is not authorized to sign');
      }
    }

    const p = {
      ...params,
      signee1,
      signee2,
      recipient,
      sender: this.actor,
    } as ContractGenSettings;

    const contract = await new ContractService().getContract(params.entityId, ['products.product']);

    file.location = await new PdfGenerator().generateContract(contract, p);
    file.downloadName = `C${file.contractId}-${contract.company.name} - ${contract.title}.${FileHelper.fileLocationToExtension(file.location)}`;

    if (params.saveToDisk) {
      try {
        await this.saveFileObject(file);
      } catch (err: any) {
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

    file.location = await new PdfGenerator().generateInvoice(invoice, p);
    file.downloadName = `F${file.invoiceId}-${invoice.company.name} - ${invoice.title}.${FileHelper.fileLocationToExtension(file.location)}`;

    if (params.saveToDisk) {
      try {
        await this.saveFileObject(file);
      } catch (err: any) {
        FileHelper.removeFile(file);
        throw new Error(err);
      }
    }

    return file;
  }

  static async generateCustomInvoice(params: CustomInvoiceGenSettings, sender: User): Promise<BaseFile> {
    const file = {
      name: params.subject,
      downloadName: `${params.ourReference} - ${params.subject}.${params.fileType.toLowerCase()}`,
      createdById: sender.id,
      createdBy: sender,
    } as any as BaseFile;

    file.location = await new PdfGenerator().generateCustomInvoice(params, file);

    return file;
  }

  private static handleFile(request: ExpressRequest): Promise<void> {
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

  async uploadFile(request: ExpressRequest, entityId: number) {
    await FileService.handleFile(request);
    await validateFileParams(request);
    const params = {
      name: request.body.name,
      entityId,
    } as FullFileParams;
    if (request.body.createdAt) params.createdAt = new Date(request.body.createdAt);
    let file = await this.createFileObject(params);
    if (request.body.name === '') {
      request.body.name = file.downloadName;
    }

    if (!request.file) {
      throw new ApiError(HTTPStatus.BadRequest, 'No file is passed in the request');
    }

    const randomFileName = `${uuidv4()}.${mime.getExtension(request.file.mimetype)}`;
    file.location = path.join(__dirname, '/../../', uploadDirLoc, randomFileName);
    fs.writeFileSync(file.location, request.file.buffer);
    file.downloadName = request.file.originalname;

    try {
      file = this.repo.save(file);
    } catch (err: any) {
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
      createdAt: params.createdAt,
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
      case CompanyFile:
        file.companyId = params.entityId;
        break;
      default:
        throw new TypeError(`Type ${this.EntityFile.constructor.name} is not a valid entity file`);
    }

    return file;
  }

  async getFile(entityId: number, fileId: number) {
    let file = await this.repo.findOneBy({ id: fileId });
    file = this.validateFileObject(file, entityId);
    return file!;
  }

  async updateFile(entityId: number, fileId: number, params: Partial<FileParams>): Promise<BaseFile> {
    let file = await this.repo.findOneBy({ id: fileId });
    file = this.validateFileObject(file, entityId);
    await this.repo.update(file!.id, params);

    file = await this.repo.findOneBy({ id: fileId });
    return file!;
  }

  async deleteFile(entityId: number, fileId: number, disk: boolean): Promise<void> {
    let file = await this.repo.findOneBy({ id: fileId });
    file = this.validateFileObject(file, entityId, false);

    if (disk) FileHelper.removeFile(file!);

    await this.repo.delete(file!.id);
  }

  /*
  The two methods below are static, because they do not interact with File entities.
  They need no repo object, so to make life easier, they are static.
  Also, they need to process uploading and verifying files, so therefore they are
  defined in this service. and not in their "own" service.
   */
  static async uploadCompanyLogo(request: ExpressRequest, companyId: number) {
    const company = await new CompanyService().getCompany(companyId);
    await FileService.handleFile(request);

    if (!request.file) {
      throw new ApiError(HTTPStatus.BadRequest, 'No file is passed in the request');
    }

    const fileExtension = mime.getExtension(request.file.mimetype) || '';
    if (!['jpg', 'jpeg', 'png', 'bmp', 'gif'].includes(fileExtension)) {
      throw new ApiError(HTTPStatus.BadRequest, 'Company logo needs to be an image file');
    }

    const randomFileName = `${uuidv4()}.${fileExtension}`;
    const fileLocation = path.join(__dirname, '/../../', uploadCompanyLogoDirLoc, randomFileName);
    company.logoFilename = randomFileName;
    fs.writeFileSync(fileLocation, request.file.buffer);
    try {
      await company.save();
    } catch (err: any) {
      FileHelper.removeFileAtLoc(fileLocation);
      throw new Error(err);
    }
  }

  static async uploadUserAvatar(request: ExpressRequest, userId: number) {
    const user = await new UserService().getUser(userId);
    await FileService.handleFile(request);

    if (!request.file) {
      throw new ApiError(HTTPStatus.BadRequest, 'No file is passed in the request');
    }

    const fileExtension = mime.getExtension(request.file.mimetype) || '';
    if (!['jpg', 'jpeg', 'png', 'bmp', 'gif'].includes(fileExtension)) {
      throw new ApiError(HTTPStatus.BadRequest, 'User avatar needs to be an image file');
    }

    const randomFileName = `${uuidv4()}.${fileExtension}`;
    const fileLocation = path.join(__dirname, '/../../', uploadUserAvatarDirLoc, randomFileName);
    user.avatarFilename = randomFileName;
    fs.writeFileSync(fileLocation, request.file.buffer);
    try {
      await user.save();
    } catch (err: any) {
      FileHelper.removeFileAtLoc(fileLocation);
      throw new Error(err);
    }
  }

  static async uploadUserBackground(request: ExpressRequest, userId: number) {
    const user = await new UserService().getUser(userId);
    await FileService.handleFile(request);

    if (!request.file) {
      throw new ApiError(HTTPStatus.BadRequest, 'No file is passed in the request');
    }

    const fileExtension = mime.getExtension(request.file.mimetype) || '';
    if (!['jpg', 'jpeg', 'png', 'bmp', 'gif'].includes(fileExtension)) {
      throw new ApiError(HTTPStatus.BadRequest, 'User background needs to be an image file');
    }

    const randomFileName = `${uuidv4()}.${fileExtension}`;
    const fileLocation = path.join(__dirname, '/../../', uploadUserBackgroundDirLoc, randomFileName);
    user.backgroundFilename = randomFileName;
    fs.writeFileSync(fileLocation, request.file.buffer);
    try {
      await user.save();
    } catch (err: any) {
      FileHelper.removeFileAtLoc(fileLocation);
      throw new Error(err);
    }
  }
}
