import { getRepository, Repository } from 'typeorm';
import BaseFile from '../entity/file/BaseFile';
import UserService from './UserService';
import { ContractFile } from '../entity/file/ContractFile';
import { InvoiceFile } from '../entity/file/InvoiceFile';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface UpdateFileParams {
  name: string;
}

export interface FileParams extends UpdateFileParams {
  createdById: number;
}

export interface FullFileParams extends FileParams {
  entityId: number;
}

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

  async createFile(params: FullFileParams) {
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

    return this.repo.save(file);
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
