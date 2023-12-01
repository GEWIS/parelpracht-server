import { In } from 'typeorm';
import { User } from '../entity/User';
import AppDataSource from '../database';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { Company } from '../entity/Company';
import BaseFile from '../entity/file/BaseFile';
import BaseActivity from '../entity/activity/BaseActivity';
import { Contract } from '../entity/Contract';
import { ContractActivity } from '../entity/activity/ContractActivity';
import { Product } from '../entity/Product';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { Invoice } from '../entity/Invoice';
import { ProductActivity } from '../entity/activity/ProductActivity';
import UserService from './UserService';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { CompanyFile } from '../entity/file/CompanyFile';
import { ContractFile } from '../entity/file/ContractFile';
import { InvoiceFile } from '../entity/file/InvoiceFile';
import { ProductFile } from '../entity/file/ProductFile';
import { ProductInstance } from '../entity/ProductInstance';

export type ActivitiesGDPRResponse = Pick<BaseActivity, 'createdAt' | 'updatedAt' | 'deletedAt' | 'type' | 'descriptionDutch' | 'descriptionEnglish'>;
export type FileGDPRResponse = Pick<BaseFile, 'createdAt' | 'updatedAt' | 'deletedAt' | 'name' | 'downloadName' | 'location'>;

export type ProductGDPRResponse = Pick<Product, 'nameDutch' | 'nameEnglish'>;

export type ProductInstanceGDPRResponse = ProductGDPRResponse & {
  activities: (ActivitiesGDPRResponse & Pick<ProductInstanceActivity, 'subType'>)[],
};

export type ContractGDPRResponse = Pick<Contract, 'title'> & {
  createdByYou: boolean,
  assignedToYou: boolean,
  activities: (ActivitiesGDPRResponse & Pick<ContractActivity, 'subType'>)[],
  files: FileGDPRResponse[],
  products: ProductInstanceGDPRResponse[],
};

export type InvoiceGDPRResponse = Pick<Invoice, 'title'> & {
  createdByYou: boolean,
  assignedToYou: boolean,
  activities: (ActivitiesGDPRResponse & Pick<InvoiceActivity, 'subType'>)[],
  files: FileGDPRResponse[],
  products: ProductInstanceGDPRResponse[],
};

export interface UserGDPRDumpResponse extends Pick<User, 'firstName' | 'lastNamePreposition' | 'lastName' | 'gender' | 'function' | 'email' | 'replyToEmail'> {
  companies: (Pick<Company, 'name'> & {
    activities: ActivitiesGDPRResponse[],
    files: FileGDPRResponse[],
    contracts: ContractGDPRResponse[]
    invoices: InvoiceGDPRResponse[],
  })[],
  products: (ProductGDPRResponse & {
    activities: (ActivitiesGDPRResponse)[],
    files: FileGDPRResponse[],
  })[],
}

export default class GDPRService {
  private remDupes<T>(arr: T[]): T[] {
    return arr.filter((elem, index, self) => index === self.indexOf(elem));
  }

  private toActivitiesGDPRResponse(a: BaseActivity): ActivitiesGDPRResponse {
    return {
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: a.deletedAt,
      type: a.type,
      descriptionDutch: a.descriptionDutch,
      descriptionEnglish: a.descriptionEnglish,
    };
  }

  private toFileGDPRResponse(f: BaseFile): FileGDPRResponse {
    return {
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      deletedAt: f.deletedAt,
      name: f.name,
      downloadName: f.downloadName,
      location: f.location,
    };
  }

  private toProductGDPRResponse(p: Product): ProductGDPRResponse {
    return {
      nameDutch: p.nameDutch,
      nameEnglish: p.nameEnglish,
    };
  }

  private toProductInstanceGDPRResponse(instance: ProductInstance, activitiesMap: Map<typeof BaseActivity, BaseActivity[]>): ProductInstanceGDPRResponse {
    return {
      nameDutch: instance.product.nameDutch,
      nameEnglish: instance.product.nameEnglish,
      activities: ((activitiesMap.get(ProductInstanceActivity) || []) as ProductInstanceActivity[])
        .filter((a) => a.productInstanceId === instance.id)
        .map((a) => ({
          ...this.toActivitiesGDPRResponse(a),
          subType: a.subType,
        })),
    };
  }

  async getDump(id: number): Promise<UserGDPRDumpResponse> {
    const user = await new UserService().getUser(id);

    const activitiesMap = new Map<typeof BaseActivity, BaseActivity[]>;
    await Promise.all([CompanyActivity, ContractActivity, InvoiceActivity, ProductActivity, ProductInstanceActivity].map(async (c) => {
      const activities = await AppDataSource.getRepository(c).find({ where: { createdById: user.id }, withDeleted: true });
      activitiesMap.set(c, activities);
    }));

    const filesMap = new Map<typeof BaseFile, BaseFile[]>;
    await Promise.all([CompanyFile, ContractFile, InvoiceFile, ProductFile].map(async (c) => {
      const files = await AppDataSource.getRepository(c).find({ where: { createdById: user.id }, withDeleted: true });
      filesMap.set(c, files);
    }));

    // Fetch all product instances this user has some activity on
    const productInstanceIds = ((activitiesMap.get(ProductInstanceActivity) || []) as ProductInstanceActivity[])
      .map((a) => a.productInstanceId);
    const productInstances = await AppDataSource.getRepository(ProductInstance)
      .find({ where: { id: In(this.remDupes(productInstanceIds)) }, relations: { product: true }, withDeleted: true });

    // Fetch all contracts where this user has some activity, file or product instance with activity
    const contractIds = ((activitiesMap.get(ContractActivity) || []) as ContractActivity[])
      .map((a) => a.contractId)
      .concat(...((filesMap.get(ContractFile) || []) as ContractFile[]).map((f) => f.contractId))
      .concat(...productInstances.map((i) => i.contractId));
    const contracts = await AppDataSource.getRepository(Contract)
      .find({ where: [
        { id: In(this.remDupes(contractIds)) },
        { createdById: user.id },
        { assignedToId: user.id },
      ], withDeleted: true });

    // Fetch all invoices where this user has some activity, file or product instance with activity
    const invoiceIds = ((activitiesMap.get(InvoiceActivity) || []) as InvoiceActivity[])
      .map((a) => a.invoiceId)
      .concat(...((filesMap.get(InvoiceFile) || []) as InvoiceFile[]).map((f) => f.invoiceId))
      .concat(...productInstances.filter((i) => i.invoiceId != null).map((i) => i.invoiceId!));
    const invoices = await AppDataSource.getRepository(Invoice)
      .find({ where: [
        { id: In(this.remDupes(invoiceIds)) },
        { createdById: user.id },
        { assignedToId: user.id },
      ], withDeleted: true });

    // Fetch all products where this user has some activity or file
    const productIds = ((activitiesMap.get(ProductActivity) || []) as ProductActivity[])
      .map((a) => a.productId)
      .concat(...((filesMap.get(ProductFile) || []) as ProductFile[]).map((f) => f.productId));
    const products = await AppDataSource.getRepository(Product)
      .find({ where: { id: In(this.remDupes(productIds)) }, withDeleted: true });

    // Fetch all companies where this user has some activity, file, contract or invoice
    const companyIds = ((activitiesMap.get(CompanyActivity) || []) as CompanyActivity[])
      .map((a) => a.companyId)
      .concat(...((filesMap.get(CompanyFile) || []) as CompanyFile[]).map((f) => f.companyId))
      .concat(...contracts.map((c) => c.companyId))
      .concat(...invoices.map((i) => i.companyId));
    const companies = await AppDataSource.getRepository(Company)
      .find({ where: { id: In(this.remDupes(companyIds)) }, withDeleted: true });

    return {
      firstName: user.firstName,
      lastNamePreposition: user.lastNamePreposition,
      lastName: user.lastName,
      gender: user.gender,
      function: user.function,
      email: user.email,
      replyToEmail: user.replyToEmail,
      companies: companies.map((company) => ({
        name: company.name,
        activities: ((activitiesMap.get(CompanyActivity) || []) as CompanyActivity[])
          .filter((a) => a.companyId === company.id)
          .map((a) => this.toActivitiesGDPRResponse(a)),
        files: ((filesMap.get(CompanyFile) || []) as CompanyFile[])
          .filter((a) => a.companyId === company.id)
          .map((f) => this.toFileGDPRResponse(f)),
        contracts: contracts.filter((c) => c.companyId === company.id).map((contract) => ({
          title: contract.title,
          createdByYou: contract.createdById === user.id,
          assignedToYou: contract.assignedToId === user.id,
          activities: ((activitiesMap.get(ContractActivity) || []) as ContractActivity[])
            .filter((a) => a.contractId === contract.id)
            .map((a) => ({
              ...this.toActivitiesGDPRResponse(a),
              subType: a.subType,
            })),
          files: ((filesMap.get(ContractFile) || []) as ContractFile[])
            .filter((a) => a.contractId === contract.id)
            .map((f) => this.toFileGDPRResponse(f)),
          products: productInstances
            .filter((i) => i.contractId === contract.id)
            .map((instance) => this.toProductInstanceGDPRResponse(instance, activitiesMap)),
        })),
        invoices: invoices.filter((i) => i.companyId === company.id).map((invoice) => ({
          title: invoice.title,
          createdByYou: invoice.createdById === user.id,
          assignedToYou: invoice.assignedToId === user.id,
          activities: ((activitiesMap.get(InvoiceActivity) || []) as InvoiceActivity[])
            .filter((a) => a.invoiceId === invoice.id)
            .map((a) => ({
              ...this.toActivitiesGDPRResponse(a),
              subType: a.subType,
            })),
          files: ((filesMap.get(InvoiceFile) || []) as InvoiceFile[])
            .filter((a) => a.invoiceId === invoice.id)
            .map((f) => this.toFileGDPRResponse(f)),
          products: productInstances
            .filter((i) => i.invoiceId === invoice.id)
            .map((instance) => this.toProductInstanceGDPRResponse(instance, activitiesMap)),
        })),
      })),
      products: products.map((product) => ({
        ...this.toProductGDPRResponse(product),
        activities: ((activitiesMap.get(ProductActivity) || []) as ProductActivity[])
          .filter((a) => a.productId === product.id)
          .map((a) => this.toActivitiesGDPRResponse(a)),
        files: ((filesMap.get(ProductFile) || []) as ProductFile[])
          .filter((p) => p.productId === product.id)
          .map((f) => this.toFileGDPRResponse(f)),
      })),
    };
  }
}
