import * as fs from 'fs';
import path from 'path';
import latex from 'node-latex';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from '../entity/Contract';
import { Invoice } from '../entity/Invoice';
import {
  ContractGenSettings,
  ContractType,
  CustomInvoiceGenSettings,
  InvoiceGenSettings,
  ReturnFileType,
} from './GenSettings';
import { ApiError, HTTPStatus } from '../helpers/error';
import { Company } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { User } from '../entity/User';
import { ProductInstance } from '../entity/ProductInstance';
import Currency from '../helpers/currency';
import FileHelper, { generateDirLoc, templateDirLoc, workDirLoc } from '../helpers/fileHelper';
import { Language } from '../entity/enums/Language';
import BaseFile from '../entity/file/BaseFile';
import replaceAll from '../helpers/replaceAll';
import countries from '../helpers/countries.json';
import { VAT } from '../entity/enums/ValueAddedTax';
import { ValueAddedTax } from '../entity/ValueAddedTax';
import AppDataSource from '../database';

const contractDutch = 'template_contract.tex';
const contractEnglish = 'template_contract_engels.tex';
const invoicePath = 'template_invoice.tex';
const quotePath = 'template_quote.tex';

// TODO make English toggle available
// TODO custom invoices

export default class PdfGenerator {
  private readonly workDir: string;

  private readonly saveDir: string;

  private readonly templateDir: string;

  constructor() {
    this.workDir = path.join(__dirname, '/../../', workDirLoc);
    this.saveDir = path.join(__dirname, '/../../', generateDirLoc);
    this.templateDir = path.join(__dirname, '/../../', templateDirLoc);
  }

  /**
   * Save a text file string (or .tex string) to the disk with the given filename in the given
   * directory
   * @param file {string} File contents parsed to a string
   * @param fileName {string} Name of the to-be-saved file
   * @param directory {string} location of the new file
   * @returns {string} The absolute location of the file
   */
  private saveFileToDisk(file: string, fileName: string, directory: string): string {
    const loc = path.join(directory, fileName);
    fs.writeFileSync(loc, file);
    return loc;
  }

  /**
   * Convert a given tex file to a PDF and save it the saveDir or workDir
   * @param input {string} Input "file" in a string
   * @param fileName {string} Name of the new .pdf file
   * @param saveToDisk {boolean} Whether the file should be saved to disk. If not,
   * it will be saved to the /tmp directory
   * @returns {string} absolute location of the new .pdf file
   */
  private async convertTexToPdf(
    input: string, fileName: string, saveToDisk: boolean,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let outputLoc: string;
      if (saveToDisk) {
        outputLoc = path.join(this.saveDir, fileName);
      } else {
        outputLoc = path.join(this.workDir, fileName);
      }
      const output = fs.createWriteStream(outputLoc);
      const pdf = latex(input, { inputs: this.templateDir, passes: 3 });
      pdf.pipe(output);
      pdf.on('error', (err) => {
        FileHelper.removeFileAtLoc(outputLoc);
        reject(err);
      });
      pdf.on('finish', () => resolve(outputLoc));
    });
  }

  /**
   * Wrap up the file generation: generating a filename, saving to the proper location on disk
   * @param file {string} The .tex file parsed as a string
   * @param fileType {ReturnFileType} The file type that should be returned
   * @param saveToDisk {boolean} Whether the file should be kept in /tmp,
   * or moved to the data folder
   * @returns {string} Absolute location of the file
   */
  private async finishFileGeneration(
    file: string, fileType: ReturnFileType, saveToDisk: boolean,
  ): Promise<string> {
    let result = '';
    let fileName = uuidv4();

    if (fileType === ReturnFileType.TEX) {
      fileName += '.tex';
      if (saveToDisk) {
        result = this.saveFileToDisk(file, fileName, this.saveDir);
      } else {
        result = this.saveFileToDisk(file, fileName, this.workDir);
      }
    }

    if (fileType === ReturnFileType.PDF) {
      // const tempFileLocation = this.saveFileToDisk(file, `${fileName}.tex`, this.workDir);
      result = await this.convertTexToPdf(file, `${fileName}.pdf`, saveToDisk);
    }

    return result;
  }

  /**
   * Replace all occurences of the "from" string with the "to" string in the "src" string
   * @param src {string} Source
   * @param from {string} String to replace
   * @param to {string} To replace all with
   */
  private replaceAllSafe(src: string, from: string, to: string) {
    to = to.replace('\\', '\\textbackslash');
    to = to.replace('~', '\\textasciitilde');
    to = to.replace('^', '\\textasciicircum');
    to = to.replace(/([&%$#_{}])/g, '\\$1');
    return replaceAll(src, from, to);
  }

  /**
   * Given the template string, replace the "basic" placeholder strings with actual information
   * @param template {string} The template tex file, parsed to a string
   * @param company {Company} Company the .pdf is addressed to
   * @param recipient {Contact} Contact the .pdf is addressed to
   * @param sender {User} Person who sent this letter
   * @param language {Language} Language of the letter
   * @param date {Date} Date at which the letter is sent
   * @param useInvoiceAddress {boolean} Whether the invoice address should be used instead of
   * the "standard" address
   * @param subject {string} Subject of the letter
   * @param ourReference {string} The reference of us, put in the designated area
   * @param theirReference {string} The reference of the company, put in the designated area
   * @returns {string} First basic .tex file with many placeholders filled in
   */
  private generateBaseTexLetter(
    template: string, company: Company, recipient: Contact, sender: User, language: Language,
    date: Date, useInvoiceAddress: boolean, subject: string, ourReference: string = '-',
    theirReference: string = '-',
  ): string {
    if (language === Language.DUTCH) {
      template = replaceAll(template, '{{language}}', 'dutch');
    } else {
      template = replaceAll(template, '{{language}}', '');
    }

    template = this.replaceAllSafe(template, '{{contactperson}}', recipient.fullName());
    template = this.replaceAllSafe(template, '{{company}}', company.name);
    template = this.replaceAllSafe(template, '{{subject}}', subject);

    template = this.replaceAllSafe(template, '{{sender}}', sender.fullName());
    template = this.replaceAllSafe(template, '{{senderfunction}}', sender.function);

    template = replaceAll(template, '{{dateday}}', date.getDate().toString());
    template = replaceAll(template, '{{datemonth}}', (date.getMonth()+1).toString());
    template = replaceAll(template, '{{dateyear}}', date.getFullYear().toString());

    if (useInvoiceAddress) {
      const companyCountry = company.invoiceAddressCountry ? countries.find((country) => country.Code
        === company.invoiceAddressCountry!.toUpperCase()) : undefined;
      template = replaceAll(template, '{{street}}', company.invoiceAddressStreet);
      template = replaceAll(template, '{{postalcode}}', company.invoiceAddressPostalCode);
      template = replaceAll(template, '{{city}}', company.invoiceAddressCity);
      template = replaceAll(template, '{{country}}', companyCountry !== undefined
        ? companyCountry.Name : company.invoiceAddressCountry);
    } else {
      const companyCountry = countries.find((country) => country.Code
        === company.addressCountry!.toUpperCase());
      template = replaceAll(template, '{{street}}', company.addressStreet);
      template = replaceAll(template, '{{postalcode}}', company.addressPostalCode);
      template = replaceAll(template, '{{city}}', company.addressCity);
      template = replaceAll(template, '{{country}}', companyCountry !== undefined
        ? companyCountry.Name : company.addressCountry);
    }

    template = replaceAll(template, '{{ourreference}}', ourReference);
    template = this.replaceAllSafe(template, '{{yourreference}}', theirReference);

    let dueDate = new Date(date);
    dueDate.setDate(date.getDate() + 30);
    template = replaceAll(template, '{{dueday}}', dueDate.getDate().toString());
    template = replaceAll(template, '{{duemonth}}', (dueDate.getMonth()+1).toString());
    template = replaceAll(template, '{{dueyear}}', dueDate.getFullYear().toString());

    return template;
  }

  /**
   * Add signees to the letter
   * @param file {string} The .tex file, parsed as a string
   * @param signee1 {User} The first signee
   * @param signee2 {User} The second signee
   * @returns {string} The letter with signees added
   */
  private createSignees(file: string, signee1: User, signee2: User) {
    file = this.replaceAllSafe(file, '{{firstcontractor}}', signee1.fullName());
    file = this.replaceAllSafe(file, '{{firstcontractorfunction}}', signee1.function);
    file = this.replaceAllSafe(file, '{{secondcontractor}}', signee2.fullName());
    file = this.replaceAllSafe(file, '{{secondcontractorfunction}}', signee2.function);
    return file;
  }

  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @returns {string} The letter with all product information added
   */
  private createSpecificationList(
    file: string, products: ProductInstance[], language: Language,
  ) {
    let contractSpecifications = '';
    let productInstance: ProductInstance;

    if (language === Language.DUTCH && !products.some((p) => p.product.deliverySpecificationDutch !== '')) {
      contractSpecifications += '\n\\item{\\textit{Er zijn geen productspecificaties voor de producten op dit document.}}\\\\';
    } else if (language === Language.ENGLISH && !products.some((p) => p.product.deliverySpecificationEnglish !== '')) {
      contractSpecifications += '\n\\item{\\textit{There are no product specifications for the products on this document.}}\\\\';
    }

    for (let i = 0; i < products.length; i++) {
      productInstance = products[i];
      if (language === Language.DUTCH) {
        if (productInstance.product.deliverySpecificationDutch !== '') {
          contractSpecifications += `\n\\item{\\textbf{${productInstance.product.nameDutch}}}\\\\`;
          contractSpecifications += `\n${productInstance.product.deliverySpecificationDutch}\n`;
        }
      } else {
        if (productInstance.product.deliverySpecificationEnglish !== '') {
          contractSpecifications += `\n\\item{\\textbf{${productInstance.product.nameEnglish}}}\\\\`;
          contractSpecifications += `\n${productInstance.product.deliverySpecificationEnglish}`;
        }
      }
    }

    file = replaceAll(file, '{{contractspecifications}}', contractSpecifications);
    return file;
  }


  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @returns {string} The letter with all product information added
   */
  private createProductList(
    file: string, products: ProductInstance[], language: Language,
  ) {
    let productList = '';
    let productInstance: ProductInstance;
    for (let i = 0; i < products.length; i++) {
      productInstance = products[i];
      if (language === Language.DUTCH) {
        if (productInstance.product.contractTextDutch !== '') {
          productList += `\\item{\\textbf{${productInstance.product.nameDutch} ${productInstance.details !== '' ? `(${productInstance.details})` : ''}}}\\\\`;
          productList += `${productInstance.product.contractTextDutch}`;
        }
      } else {
        if (productInstance.product.contractTextEnglish !== '') {
          productList += `\\item{\\textbf{${productInstance.product.nameEnglish} ${productInstance.details !== '' ? `(${productInstance.details})` : ''}}}\\\\`;
          productList += `${productInstance.product.contractTextEnglish}`;
        }
      }
    }

    file = replaceAll(file, '{{productlist}}', productList);
    return file;
  }


  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @param showDiscountPercentages {boolean} Whether all discounts should include a percentage
   * @returns {string} The letter with all product information added
   */
  private createPricingTable(
    file: string, products: ProductInstance[], language: Language, showDiscountPercentages: boolean,
  ) {
    let totalDiscountPriceNoVat = 0;
    let totalPriceWithVat = 0;
    let totalLowVatValue = 0;
    let totalHighVatValue = 0;

    let invoice = '';
    let productInstance: ProductInstance;
    for (let i = 0; i < products.length; i++) {
      productInstance = products[i];

      totalDiscountPriceNoVat += productInstance.basePrice - productInstance.discount;
      const currentPrice = productInstance.basePrice - productInstance.discount;
      const currentPriceVAT = currentPrice * (productInstance.product.valueAddedTax.amount / 100 + 1);
      totalPriceWithVat += currentPriceVAT;
      if (productInstance.product.valueAddedTax.category === VAT.LOW) {
        totalLowVatValue += currentPriceVAT - currentPrice;
      }
      if (productInstance.product.valueAddedTax.category === VAT.HIGH) {
        totalHighVatValue += currentPriceVAT - currentPrice;
      }

      if (language === Language.DUTCH) {
        invoice += `\t1 & ${productInstance.product.nameDutch} ${productInstance.details !== '' ? `(${productInstance.details})` : ''} & ${Currency.priceAttributeToEuro(productInstance.basePrice, language)} & ${productInstance.product.valueAddedTax.amount}\\% & ${Currency.priceAttributeToEuro(productInstance.basePrice, language)}\\\\\n`;
        if (productInstance.discount > 0) {
          invoice += '\t  & - Korting ';
          if (showDiscountPercentages) {
            invoice += `(${productInstance.discountPercentage()}\\%) `;
          }
          invoice += `& & ${productInstance.product.valueAddedTax.amount}\\% & ${Currency.priceAttributeToEuro(productInstance.discount, language)}\\\\\n`;
        }
      } else if (language === Language.ENGLISH) {
        invoice += `\t1 & ${productInstance.product.nameEnglish} ${productInstance.details !== '' ? `(${productInstance.details})` : ''} & ${Currency.priceAttributeToEuro(productInstance.basePrice, language)} & ${productInstance.product.valueAddedTax.amount}\\% & ${Currency.priceAttributeToEuro(productInstance.basePrice, language)}\\\\\n`;
        if (productInstance.discount > 0) {
          invoice += '\t  & - Discount ';
          if (showDiscountPercentages) {
            invoice += `(${productInstance.discountPercentage()}\\%) `;
          }
          invoice += `& & ${productInstance.product.valueAddedTax.amount}\\% & ${Currency.priceAttributeToEuro(productInstance.discount, language)}\\\\\n`;
        }
      }
    }

    file = replaceAll(file, '{{invoiceentries}}', invoice);
    file = replaceAll(file, '{{exclvat}}', Currency.priceAttributeToEuro(totalDiscountPriceNoVat, language));
    file = replaceAll(file, '{{vatlow}}', Currency.priceAttributeToEuro(totalLowVatValue, language));
    file = replaceAll(file, '{{vathigh}}', Currency.priceAttributeToEuro(totalHighVatValue, language));
    file = replaceAll(file, '{{inclvat}}', Currency.priceAttributeToEuro(totalPriceWithVat, language));
    return file;
  }


  /**
   * Generate a PDF file based on a contract. Can be an actual contract or a proposal
   * @param contract {Contract} The contract that will be generated
   * @param settings {ContractGenSettings} The corresponding generation settings
   * @returns {string} The absolute location of the generated file
   */
  public async generateContract(
    contract: Contract, settings: ContractGenSettings,
  ): Promise<string> {
    let templateLocation;
    if (settings.contentType === ContractType.CONTRACT) {
      if (settings.language === Language.DUTCH) {
        templateLocation = path.join(this.templateDir, contractDutch);
      } else {
        templateLocation = path.join(this.templateDir, contractEnglish);
      }
    } else {
      templateLocation = path.join(this.templateDir, quotePath);
    }
    if (templateLocation == null) {
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language or content type');
    }

    let file = fs.readFileSync(templateLocation).toString();
    file = this.generateBaseTexLetter(file, contract.company, settings.recipient, settings.sender,
      settings.language, new Date(), false, contract.title, `C${contract.id}`);

    file = this.createPricingTable(file, contract.products, settings.language, settings.showDiscountPercentages);
    file = this.createProductList(file, contract.products, settings.language);

    file = replaceAll(file, '{{debtornumber}}', `C${settings.recipient.id}`);

    if (settings.contentType === ContractType.CONTRACT) {
      file = this.createSpecificationList(file, contract.products, settings.language);
      if (settings.signee1 !== undefined && settings.signee2 !== undefined
      ) {
        file = this.createSignees(file, settings.signee1, settings.signee2);
      }
    }

    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }

  /**
   * Generate a PDF file based on an invoice.
   * @param invoice {Invoice} The invoice that will be generated
   * @param settings {InvoiceGenSettings} The corresponding generation settings
   * @returns {string} The absolute location of the generated file
   */
  public async generateInvoice(invoice: Invoice, settings: InvoiceGenSettings): Promise<string> {
    if (settings.language !== Language.ENGLISH && settings.language !== Language.DUTCH)
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language');

    const useInvoiceAddress = invoice.company.invoiceAddressStreet !== ''
      && invoice.company.invoiceAddressPostalCode !== ''
      && invoice.company.invoiceAddressCity !== '';

    let file = fs.readFileSync(path.join(this.templateDir, invoicePath)).toString();

    file = this.generateBaseTexLetter(file, invoice.company, settings.recipient, settings.sender,
      settings.language, invoice.startDate, useInvoiceAddress, '', `F${invoice.id}`, !!invoice.poNumber ? invoice.poNumber : undefined );

    // Setting invoice specific information
    let dueDate = new Date(invoice.startDate);
    dueDate.setDate(invoice.startDate.getDate() + 30);
    file = replaceAll(file, '{{dueday}}', dueDate.getDate().toString());
    file = replaceAll(file, '{{duemonth}}', (dueDate.getMonth()+1).toString());
    file = replaceAll(file, '{{dueyear}}', dueDate.getFullYear().toString());

    file = replaceAll(file, '{{debtornumber}}', `C${settings.recipient.id}`);

    let startDate = new Date(invoice.startDate);
    let quartiles = {
      'Q1': [new Date(invoice.startDate.getFullYear(), 6, 1), new Date(invoice.startDate.getFullYear(), 8, 30)],
      'Q2': [new Date(invoice.startDate.getFullYear(), 9, 1), new Date(invoice.startDate.getFullYear(), 11, 31)],
      'Q3': [new Date(invoice.startDate.getFullYear(), 0, 1), new Date(invoice.startDate.getFullYear(), 2, 31)],
      'Q4': [new Date(invoice.startDate.getFullYear(), 3, 1), new Date(invoice.startDate.getFullYear(), 5, 30)],
    };

    let quarterStart;
    let quarterEnd;
    if (quartiles.Q1[0] <= startDate && startDate <= quartiles.Q1[1]) {
      quarterStart = quartiles.Q1[0];
      quarterEnd = quartiles.Q1[1];
    } else if (quartiles.Q2[0] <= startDate && startDate <= quartiles.Q2[1]) {
      quarterStart = quartiles.Q2[0];
      quarterEnd = quartiles.Q2[1];
    } else if ((quartiles.Q3[0] <= startDate && startDate <= quartiles.Q3[1])) {
      quarterStart = quartiles.Q3[0];
      quarterEnd = quartiles.Q3[1];
    } else {
      quarterStart = quartiles.Q4[0];
      quarterEnd = quartiles.Q4[1];
    }

    file = replaceAll(file, '{{quarterstart}}', Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(quarterStart));
    file = replaceAll(file, '{{quarterend}}', Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(quarterEnd));

    file = this.createPricingTable(file, invoice.products, settings.language, settings.showDiscountPercentages);
    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }


  async generateCustomInvoice(params: CustomInvoiceGenSettings, fileObj: BaseFile) {
    if (params.language !== Language.ENGLISH && params.language !== Language.DUTCH)
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language');

    let file = fs.readFileSync(path.join(this.templateDir, invoicePath)).toString();

    let customCompany = new Company();
    customCompany.name = params.recipient.organizationName ? params.recipient.organizationName : params.recipient.name;
    customCompany.invoiceAddressStreet = params.recipient.street ?? '';
    customCompany.invoiceAddressPostalCode = params.recipient.postalCode ?? '';
    customCompany.invoiceAddressCity = params.recipient.city ?? '';
    customCompany.invoiceAddressCountry = params.recipient.country ?? '';

    let customRecipient = new Contact();
    customRecipient.firstName = params.recipient.organizationName ? params.recipient.name : '';
    customRecipient.lastNamePreposition = '';
    customRecipient.lastName = '';

    file = this.generateBaseTexLetter(file, customCompany, customRecipient, fileObj.createdBy,
      params.language, params.date, true, params.subject, params.ourReference, !!params.theirReference ? params.theirReference : undefined);

    // Setting invoice specific information
    let dueDate = new Date(params.date);
    dueDate.setDate(params.date.getDate() + 30);
    file = replaceAll(file, '{{dueday}}', dueDate.getDate().toString());
    file = replaceAll(file, '{{duemonth}}', (dueDate.getMonth()+1).toString());
    file = replaceAll(file, '{{dueyear}}', dueDate.getFullYear().toString());

    file = replaceAll(file, '{{debtornumber}}', params.recipient.number);

    let totalDiscountPriceNoVat = 0;
    let totalPriceWithVat = 0;
    let totalLowVatValue = 0;
    let totalHighVatValue = 0;

    const repo = AppDataSource.getRepository(ValueAddedTax);

    let invoice = '';
    let customProduct;
    for (let i = 0; i < params.products.length; i++) {
      customProduct = params.products[i];
      let basePrice = customProduct.pricePerOne * customProduct.amount;

      const valueAddedTax = await repo.findOne({
        where : {
          category: customProduct.valueAddedTax,
        },
      });

      totalDiscountPriceNoVat += basePrice;
      const currentPriceVAT = basePrice * (valueAddedTax!.amount / 100 + 1);
      totalPriceWithVat += currentPriceVAT;

      if (customProduct.valueAddedTax === VAT.LOW) {
        totalLowVatValue += currentPriceVAT - basePrice;
      }
      if (customProduct.valueAddedTax === VAT.HIGH) {
        totalHighVatValue += currentPriceVAT - basePrice;
      }
      invoice += `\t1 & ${customProduct.name} & ${Currency.priceAttributeToEuro(basePrice, params.language)} & ${valueAddedTax!.amount}\\% & ${Currency.priceAttributeToEuro(basePrice, params.language)}\\\\\n`;
    }

    file = replaceAll(file, '{{invoiceentries}}', invoice);
    file = replaceAll(file, '{{exclvat}}', Currency.priceAttributeToEuro(totalDiscountPriceNoVat, params.language));
    file = replaceAll(file, '{{vatlow}}', Currency.priceAttributeToEuro(totalLowVatValue, params.language));
    file = replaceAll(file, '{{vathigh}}', Currency.priceAttributeToEuro(totalHighVatValue, params.language));
    file = replaceAll(file, '{{inclvat}}', Currency.priceAttributeToEuro(totalPriceWithVat, params.language));

    file = replaceAll(file, '{{quarterstart}}', 'nil');
    file = replaceAll(file, '{{quarterend}}', 'nil');

    return this.finishFileGeneration(file, params.fileType, false);
  }
}
