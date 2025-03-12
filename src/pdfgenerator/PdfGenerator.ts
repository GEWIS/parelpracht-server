import * as fs from 'fs';
import path from 'path';
import latex from 'node-latex';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from '../entity/Contract';
import { Invoice } from '../entity/Invoice';
import { ApiError, HTTPStatus } from '../helpers/error';
import { Company } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { User } from '../entity/User';
import { ProductInstance } from '../entity/ProductInstance';
import Currency from '../helpers/currency';
import FileHelper, { generateDirLoc, templateDirLoc, workDirLoc } from '../helpers/fileHelper';
import { Language } from '../entity/enums/Language';
import BaseFile from '../entity/file/BaseFile';
import countries from '../helpers/countries.json';
import { VAT } from '../entity/enums/ValueAddedTax';
import { ValueAddedTax } from '../entity/ValueAddedTax';
import AppDataSource from '../database';
import {
  ContractGenSettings,
  ContractType,
  CustomInvoiceGenSettings,
  InvoiceGenSettings,
  ReturnFileType,
} from './GenSettings';

const contractDutch = 'template_contract.tex';
const contractEnglish = 'template_contract_engels.tex';
const invoicePath = 'template_invoice.tex';
const quotePath = 'template_quote.tex';

// TODO make English toggle available
// TODO custom invoices

type Quartiles = {
  Q1: [Date, Date];
  Q2: [Date, Date];
  Q3: [Date, Date];
  Q4: [Date, Date];
};

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
  private async convertTexToPdf(input: string, fileName: string, saveToDisk: boolean): Promise<string> {
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
  private async finishFileGeneration(file: string, fileType: ReturnFileType, saveToDisk: boolean): Promise<string> {
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
   * @param src {string} String to escape
   */
  private escapeString(src: string) {
    src = src.replaceAll('\\', '\\textbackslash');
    src = src.replaceAll('~', '\\textasciitilde');
    src = src.replaceAll('^', '\\textasciicircum');
    return src.replaceAll(/([&%$#_{}])/g, '\\$1');
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
    template: string,
    company: Company,
    recipient: Contact,
    sender: User,
    language: Language,
    date: Date,
    useInvoiceAddress: boolean,
    subject: string,
    ourReference: string = '-',
    theirReference: string = '-',
  ): string {
    if (language === Language.DUTCH) {
      template = template.replaceAll('{{language}}', 'dutch');
    } else {
      template = template.replaceAll('{{language}}', '');
    }

    template = template.replaceAll('{{contactperson}}', this.escapeString(recipient.fullName()));
    template = template.replaceAll('{{company}}', this.escapeString(company.name));
    template = template.replaceAll('{{subject}}', this.escapeString(subject));

    template = template.replaceAll('{{sender}}', this.escapeString(sender.fullName()));
    template = template.replaceAll('{{senderfunction}}', this.escapeString(sender.function));

    template = template.replaceAll('{{dateday}}', date.getDate().toString());
    template = template.replaceAll('{{datemonth}}', (date.getMonth() + 1).toString());
    template = template.replaceAll('{{dateyear}}', date.getFullYear().toString());

    if (useInvoiceAddress) {
      const companyCountry = company.invoiceAddressCountry
        ? countries.find((country) => country.Code === company.invoiceAddressCountry.toUpperCase())
        : undefined;
      template = template.replaceAll('{{street}}', company.invoiceAddressStreet);
      template = template.replaceAll('{{postalcode}}', company.invoiceAddressPostalCode);
      template = template.replaceAll('{{city}}', company.invoiceAddressCity);
      template = template.replaceAll(
        '{{country}}',
        companyCountry !== undefined ? companyCountry.Name : company.invoiceAddressCountry,
      );
    } else {
      const companyCountry = countries.find((country) => country.Code === company.addressCountry.toUpperCase());
      template = template.replaceAll('{{street}}', company.addressStreet);
      template = template.replaceAll('{{postalcode}}', company.addressPostalCode);
      template = template.replaceAll('{{city}}', company.addressCity);
      template = template.replaceAll(
        '{{country}}',
        companyCountry !== undefined ? companyCountry.Name : company.addressCountry,
      );
    }

    template = template.replaceAll('{{ourreference}}', ourReference);
    template = template.replaceAll('{{yourreference}}', this.escapeString(theirReference));

    const dueDate = new Date(date);
    dueDate.setDate(date.getDate() + 30);
    template = template.replaceAll('{{dueday}}', dueDate.getDate().toString());
    template = template.replaceAll('{{duemonth}}', (dueDate.getMonth() + 1).toString());
    template = template.replaceAll('{{dueyear}}', dueDate.getFullYear().toString());

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
    file = file.replaceAll('{{firstcontractor}}', this.escapeString(signee1.fullName()));
    file = file.replaceAll('{{firstcontractorfunction}}', this.escapeString(signee1.function));
    file = file.replaceAll('{{secondcontractor}}', this.escapeString(signee2.fullName()));
    file = file.replaceAll('{{secondcontractorfunction}}', this.escapeString(signee2.function));
    return file;
  }

  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @returns {string} The letter with all product information added
   */
  private createSpecificationList(file: string, products: ProductInstance[], language: Language) {
    let contractSpecifications = '';

    if (language === Language.DUTCH && !products.some((p) => p.product.deliverySpecificationDutch !== '')) {
      contractSpecifications +=
        '\n\\item{\\textit{Er zijn geen productspecificaties voor de producten op dit document.}}\\\\';
    } else if (language === Language.ENGLISH && !products.some((p) => p.product.deliverySpecificationEnglish !== '')) {
      contractSpecifications +=
        '\n\\item{\\textit{There are no product specifications for the products on this document.}}\\\\';
    }

    for (const productInstance of products) {
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

    file = file.replaceAll('{{contractspecifications}}', contractSpecifications);
    return file;
  }

  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @returns {string} The letter with all product information added
   */
  private createProductList(file: string, products: ProductInstance[], language: Language) {
    let productList = '';
    for (const productInstance of products) {
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

    return file.replaceAll('{{productlist}}', productList);
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
    file: string,
    products: ProductInstance[],
    language: Language,
    showDiscountPercentages: boolean,
  ) {
    let totalDiscountPriceNoVat = 0;
    let totalPriceWithVat = 0;
    let totalLowVatValue = 0;
    let totalHighVatValue = 0;

    let invoice = '';
    for (const productInstance of products) {
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

    file = file.replaceAll('{{invoiceentries}}', invoice);
    file = file.replaceAll('{{exclvat}}', Currency.priceAttributeToEuro(totalDiscountPriceNoVat, language));
    file = file.replaceAll('{{vatlow}}', Currency.priceAttributeToEuro(totalLowVatValue, language));
    file = file.replaceAll('{{vathigh}}', Currency.priceAttributeToEuro(totalHighVatValue, language));
    file = file.replaceAll('{{inclvat}}', Currency.priceAttributeToEuro(totalPriceWithVat, language));
    return file;
  }

  /**
   * Generate a PDF file based on a contract. Can be an actual contract or a proposal
   * @param contract {Contract} The contract that will be generated
   * @param settings {ContractGenSettings} The corresponding generation settings
   * @returns {string} The absolute location of the generated file
   */
  public async generateContract(contract: Contract, settings: ContractGenSettings): Promise<string> {
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
    file = this.generateBaseTexLetter(
      file,
      contract.company,
      settings.recipient,
      settings.sender,
      settings.language,
      new Date(),
      false,
      contract.title,
      `C${contract.id}`,
    );

    file = this.createPricingTable(file, contract.products, settings.language, settings.showDiscountPercentages);
    file = this.createProductList(file, contract.products, settings.language);

    file = file.replaceAll('{{debtornumber}}', `C${settings.recipient.id}`);

    if (settings.contentType === ContractType.CONTRACT) {
      file = this.createSpecificationList(file, contract.products, settings.language);
      if (settings.signee1 !== undefined && settings.signee2 !== undefined) {
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

    const useInvoiceAddress =
      invoice.company.invoiceAddressStreet !== '' &&
      invoice.company.invoiceAddressPostalCode !== '' &&
      invoice.company.invoiceAddressCity !== '';

    let file = fs.readFileSync(path.join(this.templateDir, invoicePath)).toString();

    file = this.generateBaseTexLetter(
      file,
      invoice.company,
      settings.recipient,
      settings.sender,
      settings.language,
      invoice.startDate,
      useInvoiceAddress,
      '',
      `F${invoice.id}`,
      invoice.poNumber ? invoice.poNumber : undefined,
    );

    // Setting invoice specific information
    const dueDate = new Date(invoice.startDate);
    dueDate.setDate(invoice.startDate.getDate() + 30);
    file = file.replaceAll('{{dueday}}', dueDate.getDate().toString());
    file = file.replaceAll('{{duemonth}}', (dueDate.getMonth() + 1).toString());
    file = file.replaceAll('{{dueyear}}', dueDate.getFullYear().toString());

    file = file.replaceAll('{{debtornumber}}', `C${settings.recipient.id}`);

    const startDate = new Date(invoice.startDate);
    const quartiles: Quartiles = {
      Q1: [new Date(invoice.startDate.getFullYear(), 6, 1), new Date(invoice.startDate.getFullYear(), 8, 30)],
      Q2: [new Date(invoice.startDate.getFullYear(), 9, 1), new Date(invoice.startDate.getFullYear(), 11, 31)],
      Q3: [new Date(invoice.startDate.getFullYear(), 0, 1), new Date(invoice.startDate.getFullYear(), 2, 31)],
      Q4: [new Date(invoice.startDate.getFullYear(), 3, 1), new Date(invoice.startDate.getFullYear(), 5, 30)],
    };

    let quarterStart;
    let quarterEnd;
    if (quartiles.Q1[0] <= startDate && startDate <= quartiles.Q1[1]) {
      quarterStart = quartiles.Q1[0];
      quarterEnd = quartiles.Q1[1];
    } else if (quartiles.Q2[0] <= startDate && startDate <= quartiles.Q2[1]) {
      quarterStart = quartiles.Q2[0];
      quarterEnd = quartiles.Q2[1];
    } else if (quartiles.Q3[0] <= startDate && startDate <= quartiles.Q3[1]) {
      quarterStart = quartiles.Q3[0];
      quarterEnd = quartiles.Q3[1];
    } else {
      quarterStart = quartiles.Q4[0];
      quarterEnd = quartiles.Q4[1];
    }

    file = file.replaceAll(
      '{{quarterstart}}',
      Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(quarterStart),
    );
    file = file.replaceAll('{{quarterend}}', Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(quarterEnd));

    file = this.createPricingTable(file, invoice.products, settings.language, settings.showDiscountPercentages);
    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }

  async generateCustomInvoice(params: CustomInvoiceGenSettings, fileObj: BaseFile) {
    if (params.language !== Language.ENGLISH && params.language !== Language.DUTCH)
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language');

    let file = fs.readFileSync(path.join(this.templateDir, invoicePath)).toString();

    const customCompany = new Company();
    customCompany.name = params.recipient.organizationName ? params.recipient.organizationName : params.recipient.name;
    customCompany.invoiceAddressStreet = params.recipient.street ?? '';
    customCompany.invoiceAddressPostalCode = params.recipient.postalCode ?? '';
    customCompany.invoiceAddressCity = params.recipient.city ?? '';
    customCompany.invoiceAddressCountry = params.recipient.country ?? '';

    const customRecipient = new Contact();
    customRecipient.firstName = params.recipient.organizationName ? params.recipient.name : '';
    customRecipient.lastNamePreposition = '';
    customRecipient.lastName = '';

    file = this.generateBaseTexLetter(
      file,
      customCompany,
      customRecipient,
      fileObj.createdBy,
      params.language,
      params.date,
      true,
      params.subject,
      params.ourReference,
      params.theirReference ? params.theirReference : undefined,
    );

    // Setting invoice specific information
    const dueDate = new Date(params.date);
    dueDate.setDate(params.date.getDate() + 30);
    file = file.replaceAll('{{dueday}}', dueDate.getDate().toString());
    file = file.replaceAll('{{duemonth}}', (dueDate.getMonth() + 1).toString());
    file = file.replaceAll('{{dueyear}}', dueDate.getFullYear().toString());

    file = file.replaceAll('{{debtornumber}}', params.recipient.number);

    let totalDiscountPriceNoVat = 0;
    let totalPriceWithVat = 0;
    let totalLowVatValue = 0;
    let totalHighVatValue = 0;

    const repo = AppDataSource.getRepository(ValueAddedTax);

    let invoice = '';
    for (const customProduct of params.products) {
      const basePrice = customProduct.pricePerOne * customProduct.amount;

      const valueAddedTax = await repo.findOne({
        where: {
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

    file = file.replaceAll('{{invoiceentries}}', invoice);
    file = file.replaceAll('{{exclvat}}', Currency.priceAttributeToEuro(totalDiscountPriceNoVat, params.language));
    file = file.replaceAll('{{vatlow}}', Currency.priceAttributeToEuro(totalLowVatValue, params.language));
    file = file.replaceAll('{{vathigh}}', Currency.priceAttributeToEuro(totalHighVatValue, params.language));
    file = file.replaceAll('{{inclvat}}', Currency.priceAttributeToEuro(totalPriceWithVat, params.language));

    file = file.replaceAll('{{quarterstart}}', 'nil');
    file = file.replaceAll('{{quarterend}}', 'nil');

    return this.finishFileGeneration(file, params.fileType, false);
  }
}
