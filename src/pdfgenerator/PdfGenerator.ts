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
import { Gender } from '../entity/enums/Gender';
import { Language } from '../entity/enums/Language';
import BaseFile from '../entity/file/BaseFile';
import replaceAll from '../helpers/replaceAll';
import countries from '../helpers/countries.json';
import { VAT } from '../entity/enums/ValueAddedTax';

const contractDutch = 'template_contract.tex';
const contractEnglish = 'template_contract_engels.tex';
const invoiceDutch = 'template_factuur.tex';
const invoiceEnglish = 'template_factuur_engels.tex';
const proposalDutch = 'template_sponsorvoorstel.tex';
const proposalEnglish = 'template_sponsorvoorstel_engels.tex';

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
    let t = template;

    if (language === Language.DUTCH)
      t = replaceAll(t, '{{language}}', 'dutch');

    t = replaceAll(t, '{{contactperson}}', recipient.fullName());
    t = replaceAll(t, '{{company}}', company.name);
    t = replaceAll(t, '{{subject}}', subject);

    //TODO NODIG VOOR CONTRACT
    // t = replaceAll(t, '%{sender}\n', sender.fullName());
    // t = replaceAll(t, '%{senderfunctie}\n', sender.function);

    t = replaceAll(t, '{{dateday}}', date.getDay().toString());
    t = replaceAll(t, '{{datemonth}}', date.getMonth().toString());
    t = replaceAll(t, '{{dateyear}}', date.getFullYear().toString());

    if (useInvoiceAddress) {
      const companyCountry = countries.find((country) => country.Code
        === company.invoiceAddressCountry!.toUpperCase());
      t = replaceAll(t, '{{street}}', company.invoiceAddressStreet!);
      t = replaceAll(t, '{{postalcode}}', company.invoiceAddressPostalCode!);
      t = replaceAll(t, '{{city}}', company.invoiceAddressCity!);
      t = replaceAll(t, '{{country}}', companyCountry !== undefined
        ? companyCountry.Name : company.invoiceAddressCountry!);
    } else {
      const companyCountry = countries.find((country) => country.Code
        === company.addressCountry!.toUpperCase());
      t = replaceAll(t, '{{street}}', company.addressStreet);
      t = replaceAll(t, '{{postalcode}}', company.addressPostalCode!);
      t = replaceAll(t, '{{city}}', company.addressCity!);
      t = replaceAll(t, '{{country}}', companyCountry !== undefined
        ? companyCountry.Name : company.addressCountry!);
    }

    // TODO SET FOR CONTRACT
    // let greeting = '';
    // if (language === Language.DUTCH) {
    //   switch (recipient.gender) {
    //   case Gender.MALE: greeting = `heer ${recipient.formalGreet()}`; break;
    //   case Gender.FEMALE: greeting = `mevrouw ${recipient.formalGreet()}`; break;
    //   default: greeting = recipient.fullName();
    //   }
    // } else if (language === Language.ENGLISH) {
    //   switch (recipient.gender) {
    //   case Gender.MALE: greeting = `mr. ${recipient.formalGreet()}`; break;
    //   case Gender.FEMALE: greeting = `ms. ${recipient.formalGreet()}`; break;
    //   default: greeting = recipient.fullName();
    //   }
    // }
    // t = replaceAll(t, '%{ontvanger}\n', greeting);

    // TODO SET FOR CONTRACT
    // let mail = '';
    // if (sender.replyToEmail.length > 0) {
    //   mail = sender.replyToEmail;
    // } else {
    //   mail = 'ceb@gewis.nl';
    // }
    //
    // t = replaceAll(t, '%{senderemail}\n', mail);

    return t;
  }

  /**
   * Add signees to the letter
   * @param file {string} The .tex file, parsed as a string
   * @param signee1 {User} The first signee
   * @param signee2 {User} The second signee
   * @returns {string} The letter with signees added
   */
  private createSignees(file: string, signee1: User, signee2: User) {
    let f = file;
    f = replaceAll(f, '%{contractant1}\n', signee1.fullName());
    f = replaceAll(f, '%{contractant1_functie}\n', signee1.function);
    f = replaceAll(f, '%{contractant2}\n', signee2.fullName());
    f = replaceAll(f, '%{contractant2_functie}\n', signee2.function);
    return f;
  }

  enumToVatAmount = (valueAddedTax: VAT) => {
    switch (valueAddedTax) {
    case VAT.LOW:
      return 1.09;
    case VAT.HIGH:
      return 1.21;
    default:
      return 1;
    }
  };

  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @param showDiscountPercentages {boolean} Whether all discounts should include a percentage
   * @returns {string} The letter with all product information added
   */
  private createProductTables(
    file: string, products: ProductInstance[], language: Language, showDiscountPercentages: boolean,
  ) {
    let f = file;
    let totalDiscountPriceNoVat = 0;
    let totalPriceWithVat = 0;
    let totalLowVatValue = 0;
    let totalHighVatValue = 0;

    let mT = '';
    let dT = '';
    let invoice = '';
    let p: ProductInstance;
    for (let i = 0; i < products.length; i++) {
      p = products[i];

      totalDiscountPriceNoVat += p.basePrice - p.discount;
      const currentPrice = p.basePrice - p.discount;
      // const currentPriceVAT = currentPrice * this.enumToVatAmount(p.product.valueAddedTax);
      // totalPriceWithVat += currentPriceVAT;
      // if (p.product.valueAddedTax === VAT.LOW) {
      //   totalLowVatValue += currentPriceVAT - currentPrice;
      // }
      // if (p.product.valueAddedTax === VAT.HIGH) {
      //   totalHighVatValue += currentPriceVAT - currentPrice;
      // }

      // 1 stuk				& Lunchlezing		& \euro1149,50		& 21\%			& \euro 1149,50\\
      if (language === Language.DUTCH) {
        if (p.product.contractTextDutch !== '') {
          mT += `\\item{\\textbf{${p.product.nameDutch} ${p.details !== '' ? `(${p.details})` : ''}}\\\\\n`;
          mT += `${p.product.contractTextDutch}}\n`;
        }

        if (p.product.deliverySpecificationDutch !== '') {
          dT += `\\item{\\textbf{${p.product.nameDutch}}\\\\\n`;
          dT += `${p.product.deliverySpecificationDutch}}\n`;
        }

        // TODO INVOICES PRODUCT

        invoice += `\t1 & ${p.product.nameDutch} ${p.details !== '' ? `(${p.details})` : ''} & ${Currency.priceAttributeToEuro(p.basePrice, language)} & ${p.product.valueAddedTax} & ${Currency.priceAttributeToEuro(p.basePrice, language)}\\\\\n`;
        if (p.discount > 0) {
          invoice += '\t  & - Korting ';
          if (showDiscountPercentages) {
            invoice += `(${p.discountPercentage()}\\%) `;
          }
          invoice += `${Currency.priceAttributeToEuro(p.discount, language)} & ${p.product.valueAddedTax} & ${Currency.priceAttributeToEuro(p.discount, language)}\\\\\n`;
        }
      } else if (language === Language.ENGLISH) {
        if (p.product.contractTextEnglish !== '') {
          mT += `\\item{\\textbf{${p.product.nameEnglish} ${p.details !== '' ? `(${p.details})` : ''}}\\\\\n`;
          mT += `${p.product.contractTextEnglish}}\n`;
        }

        if (p.product.deliverySpecificationEnglish !== '') {
          dT += `\\item{\\textbf{${p.product.nameEnglish}}\\\\\n`;
          dT += `${p.product.deliverySpecificationEnglish}}\n`;
        }

        // TODO INVOCIES DISCOUNT
        invoice += `\t1 & ${p.product.nameEnglish} ${p.details !== '' ? `(${p.details})` : ''} & ${Currency.priceAttributeToEuro(p.basePrice, language)} 7 ${p.product.valueAddedTax} & ${Currency.priceAttributeToEuro(p.basePrice, language)}\\\\\n`;
        if (p.discount > 0) {
          invoice += '\t  & - Discount ';
          if (showDiscountPercentages) {
            invoice += `(${p.discountPercentage()}\\%) `;
          }
          invoice += `${Currency.priceAttributeToEuro(p.discount, language)} & ${p.product.valueAddedTax} & ${Currency.priceAttributeToEuro(p.discount, language)}\\\\\n`;
        }
      }
    }

    if (mT !== '') {
      mT = `\\begin{itemize}\n
        ${mT}\n
        \\end{itemize}`;
    }

    if (dT !== '') {
      if (language === Language.DUTCH) {
        dT = `\\subsection{Aanleverspecificatie}\n
          \\begin{itemize}\n
          ${dT}\n
          \\end{itemize}`;
      } else if (language === Language.ENGLISH) {
        dT = `\\subsection{Delivery specifications}\n
          \\begin{itemize}\n
          ${dT}\n
          \\end{itemize}`;
      }
    }


    // let totalPrice = 0;
    // let priceSum = 0;
    // let discountAmount = 0;
    // let discountSum = 0;
    // let priceSumVAT = 0;
    // let lowVATsum = 0;
    // let highVATsum = 0;

    // TODO aanpassen voor contracten
    f = replaceAll(f, '%{producten}', mT);
    f = replaceAll(f, '%{aanleverspecificatie}', dT);

    // For invoices
    f = replaceAll(f, '{{invoicerows}}', invoice);
    f = replaceAll(f, '{{exclvat}}', Currency.priceAttributeToEuro(totalDiscountPriceNoVat, language));
    f = replaceAll(f, '{{vatlow}}', Currency.priceAttributeToEuro(totalLowVatValue, language));
    f = replaceAll(f, '{{vathigh}}', Currency.priceAttributeToEuro(totalHighVatValue, language));
    f = replaceAll(f, '{{inclvat}}', Currency.priceAttributeToEuro(totalPriceWithVat, language));
    return f;
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
   * Generate a PDF file based on a contract. Can be an actual contract or a proposal
   * @param contract {Contract} The contract that will be generated
   * @param settings {ContractGenSettings} The corresponding generation settings
   * @returns {string} The absolute location of the generated file
   */
  public async generateContract(
    contract: Contract, settings: ContractGenSettings,
  ): Promise<string> {
    let templateLocation;
    if (settings.language === Language.DUTCH) {
      if (settings.contentType === ContractType.CONTRACT) {
        templateLocation = path.join(this.templateDir, contractDutch);
      } else if (settings.contentType === ContractType.PROPOSAL) {
        templateLocation = path.join(this.templateDir, proposalDutch);
      }
    } else if (settings.language === Language.ENGLISH) {
      if (settings.contentType === ContractType.CONTRACT) {
        templateLocation = path.join(this.templateDir, contractEnglish);
      } else if (settings.contentType === ContractType.PROPOSAL) {
        templateLocation = path.join(this.templateDir, proposalEnglish);
      }
    }
    if (templateLocation == null) {
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language or content type');
    }

    let file = fs.readFileSync(templateLocation).toString();
    file = this.generateBaseTexLetter(file, contract.company, settings.recipient, settings.sender,
      settings.language, new Date(), false, contract.title, `C${contract.id}`);
    file = this.createProductTables(file, contract.products, settings.language,
      settings.showDiscountPercentages);
    if (settings.contentType === ContractType.CONTRACT
      && settings.signee1 !== undefined && settings.signee2 !== undefined
    ) {
      file = this.createSignees(file, settings.signee1, settings.signee2);
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

    let file = fs.readFileSync(path.join(this.templateDir, 'template_factuur.tex')).toString();

    file = this.generateBaseTexLetter(file, invoice.company, settings.recipient, settings.sender,
      settings.language, invoice.startDate, useInvoiceAddress, '', `F${invoice.id}`, invoice.poNumber);

    // Setting invoice specific information
    let dueDate = new Date(invoice.startDate);
    dueDate.setDate(invoice.startDate.getDate() + 30);
    file = replaceAll(file, '{{dueday}}', dueDate.getDay().toString());
    file = replaceAll(file, '{{duemonth}}', dueDate.getMonth().toString());
    file = replaceAll(file, '{{dueyear}}', dueDate.getFullYear().toString());

    file = replaceAll(file, '{{ourreference}}', `F${invoice.id}`);
    file = replaceAll(file, '{{yourreference}}', invoice.poNumber ?? '-');
    file = replaceAll(file, '{{debtornumber}}', `C${settings.recipient.id}`);

    // TODO CHANGE TO FIT NEW TEMPLATE
    // TODO CHANGE AND IMPLEMENT BETALINGSTERMIJN
    // TODO ADD DEBTOR NUMBER
    // TODO ADD QUATERS AS "START CURRENT QUARTER --- MIN(END DATE, CURRENT DATE)"

    file = this.createProductTables(file, invoice.products, settings.language,
      settings.showDiscountPercentages);
    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }

  async generateCustomInvoice(params: CustomInvoiceGenSettings, fileObj: BaseFile) {
    if (params.language !== Language.ENGLISH && params.language !== Language.DUTCH)
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language');

    let t = fs.readFileSync(path.join(this.templateDir, 'template_factuur.tex')).toString();
    t = replaceAll(t, '%{contactperson}\n', params.recipient.name);
    t = replaceAll(t, '%{sender}\n', fileObj.createdBy.fullName());
    t = replaceAll(t, '%{senderfunctie}\n', fileObj.createdBy.function);
    t = replaceAll(t, '%{company}\n', params.recipient.organizationName ?? '');
    t = replaceAll(t, '%{subject}\n', params.subject);
    t = replaceAll(t, '%{ourreference}\n', params.ourReference);
    t = replaceAll(t, '%{yourreference}\n', params.theirReference ?? '');
    t = replaceAll(t, '%{street}\n', params.recipient.street ?? '');
    t = replaceAll(t, '%{postalcode}\n', params.recipient.postalCode ?? '');
    t = replaceAll(t, '%{city}\n', params.recipient.city ?? '');
    t = replaceAll(t, '%{country}\n', params.recipient.country ?? '');
    t = replaceAll(t, '%{occasion}\n', params.invoiceReason);

    let locales;
    switch (params.language) {
    case Language.DUTCH: locales = 'nl-NL'; break;
    case Language.ENGLISH: locales = 'en-US'; break;
    default: throw new Error(`Unknown language: ${params.language}`);
    }
    t = replaceAll(t, '%{date}', new Intl.DateTimeFormat(locales, { dateStyle: 'long' }).format(params.date));

    let greeting = '';
    if (params.language === Language.DUTCH) {
      switch (params.recipient.gender) {
      case Gender.MALE: greeting = `heer ${params.recipient.name}`; break;
      case Gender.FEMALE: greeting = `mevrouw ${params.recipient.name}`; break;
      default: greeting = params.recipient.name;
      }
    } else if (params.language === Language.ENGLISH) {
      switch (params.recipient.gender) {
      case Gender.MALE: greeting = `mr. ${params.recipient.name}`; break;
      case Gender.FEMALE: greeting = `ms. ${params.recipient.name}`; break;
      default: greeting = params.recipient.name;
      }
    }
    t = replaceAll(t, '%{ontvanger}\n', greeting);

    let mail = '';
    if (fileObj.createdBy.replyToEmail.length > 0) {
      mail = fileObj.createdBy.replyToEmail;
    } else {
      mail = 'ceb@gewis.nl';
    }

    t = replaceAll(t, '%{senderemail}\n', mail);

    let totalPrice = 0;
    let table = '';
    params.products.forEach((p) => {
      totalPrice += p.amount * p.pricePerOne;
      table += `${p.name} & ${Currency.priceAttributeToEuro(p.pricePerOne, params.language)} & ${p.amount} & ${Currency.priceAttributeToEuro(p.amount * p.pricePerOne, params.language)}\\\\\n`;
    });
    if (params.language === Language.DUTCH) {
      table = `\\begin{tabularx}{\\textwidth}{X r r r}\\toprule
        Beschrijving & Bedrag (EUR) & Aantal & Subtotaal (EUR) \\\\\\midrule
        ${table}
        \\cmidrule{4-4} \\textbf{Totaal} & & & {\\bfseries ${Currency.priceAttributeToEuro(totalPrice, Language.DUTCH)}
        }\\\\\\bottomrule
        \\end{tabularx}`;
    } else if (params.language === Language.ENGLISH) {
      table = `\\begin{tabularx}{\\textwidth}{X r r r}\\toprule
        Description & Price (EUR) & Amount & Subtotal (EUR) \\\\\\midrule
        ${table}
        \\cmidrule{4-4} \\textbf{Total} & & & {\\bfseries ${Currency.priceAttributeToEuro(totalPrice, Language.ENGLISH)}
        }\\\\\\bottomrule
        \\end{tabularx}`;
    }
    t = replaceAll(t, '%{tabelproducten}', table);

    return this.finishFileGeneration(t, params.fileType, false);
  }
}
