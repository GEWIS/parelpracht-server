import * as fs from 'fs';
import path from 'path';
import latex from 'node-latex';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from '../entity/Contract';
import { Invoice } from '../entity/Invoice';
import {
  ContractGenSettings, ContractType, InvoiceGenSettings, Language, ReturnFileType,
} from './GenSettings';
import { ApiError, HTTPStatus } from '../helpers/error';
import { Company } from '../entity/Company';
import { Contact } from '../entity/Contact';
import { Gender, User } from '../entity/User';
import { ProductInstance } from '../entity/ProductInstance';
import Currency from '../helpers/currency';
import FileHelper, { generateDirLoc, templateDirLoc, workDirLoc } from '../helpers/fileHelper';

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
   * @param fileLocation {string }Absolute location of the .tex file
   * @param fileName {string }Name of the new .pdf file
   * @param saveToDisk {boolean} Whether the file should be saved to disk. If not,
   * it will be saved to the /tmp directory
   * @returns {string} absolute location of the new .pdf file
   */
  private async convertTexToPdf(
    fileLocation: string, fileName: string, saveToDisk: boolean,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = fs.createReadStream(fileLocation);
      let outputLoc: string;
      if (saveToDisk) {
        outputLoc = path.join(this.saveDir, fileName);
      } else {
        outputLoc = path.join(this.workDir, fileName);
      }
      const output = fs.createWriteStream(outputLoc);
      const pdf = latex(input, { inputs: path.join(this.saveDir, '/../templates/') });
      pdf.pipe(output);
      pdf.on('error', (err) => {
        FileHelper.removeFileLoc(outputLoc);
        reject(err);
      });
      pdf.on('finish', () => resolve(outputLoc));
    });
  }

  /**
   * Replace all occurences of the "from" string with the "to" string in the "src" string
   * @param src {string} Source
   * @param from {string} String to replace
   * @param to {string} To replace all with
   */
  private static fr(src: string, from: string, to: string) {
    let src2 = src;
    const fromAll = [from];

    // If there is a newline symbol in the string (\n), replace them all with the Windows
    // newline symbol (\r\n)
    const newLines = (from.match(/\n/g) || []).length;
    if (newLines > 0) {
      fromAll.push(from.replace('\n', '\r\n'));
    }
    for (let i = 0; i < newLines - 1; i++) {
      fromAll[1] = fromAll[1].replace('\n', '\r\n');
    }

    for (let i = 0; i < fromAll.length; i++) {
      const count = (src.match(new RegExp(fromAll[i], 'g')) || []).length;
      for (let j = 0; j < count; j++) {
        src2 = src2.replace(fromAll[i], to);
      }
    }
    return src2;
  }

  /**
   * Given the template string, replace the "basic" placeholder strings with actual information
   * @param template {string} The template tex file, parsed to a string
   * @param company {Company} Company the .pdf is addressed to
   * @param recipient {Contact} Contact the .pdf is addressed to
   * @param sender {User} Person who sent this letter
   * @param language {Language} Language of the letter
   * @param useInvoiceAddress {boolean} Whether the invoice address should be used instead of
   * the "standard" address
   * @param subject {string} Subject of the letter
   * @param ourReference {string} The reference of us, put in the designated area
   * @param theirReference {string} The reference of the company, put in the designated area
   * @returns {string} First basic .tex file with many placeholders filled in
   */
  private generateBaseTexLetter(
    template: string, company: Company, recipient: Contact, sender: User, language: Language,
    useInvoiceAddress: boolean, subject: string, ourReference: string = '', theirReference: string = '',
  ): string {
    let t = template;

    t = PdfGenerator.fr(t, '%{contactperson}\n', recipient.fullname());
    t = PdfGenerator.fr(t, '%{sender}\n', sender.fullname());
    t = PdfGenerator.fr(t, '%{senderfunctie}\n', sender.function);
    t = PdfGenerator.fr(t, '%{company}\n', company.name);
    t = PdfGenerator.fr(t, '%{subject}\n', subject);
    t = PdfGenerator.fr(t, '%{ourreference}', ourReference);
    t = PdfGenerator.fr(t, '%{yourreference}', theirReference);
    t = PdfGenerator.fr(t, '%{senderemail}\n', sender.email);

    if (useInvoiceAddress) {
      t = PdfGenerator.fr(t, '%{street}\n', company.invoiceAddressStreet!);
      t = PdfGenerator.fr(t, '%{postalcode}\n', company.invoiceAddressPostalCode!);
      t = PdfGenerator.fr(t, '%{city}\n', company.invoiceAddressCity!);
      t = PdfGenerator.fr(t, '%{country}\n', company.invoiceAddressCountry!);
    } else {
      t = PdfGenerator.fr(t, '%{street}\n', company.addressStreet);
      t = PdfGenerator.fr(t, '%{postalcode}\n', company.addressPostalCode!);
      t = PdfGenerator.fr(t, '%{city}\n', company.addressCity!);
      t = PdfGenerator.fr(t, '%{country}\n', company.addressCountry!);
    }

    let greeting = '';
    if (language === Language.DUTCH) {
      switch (recipient.gender) {
        case Gender.MALE: greeting = `heer ${recipient.lastName}`; break;
        case Gender.FEMALE: greeting = `mevrouw ${recipient.lastName}`; break;
        default: greeting = recipient.fullname();
      }
    } else if (language === Language.ENGLISH) {
      switch (recipient.gender) {
        case Gender.MALE: greeting = `mr. ${recipient.lastName}`; break;
        case Gender.FEMALE: greeting = `ms. ${recipient.lastName}`; break;
        default: greeting = recipient.fullname();
      }
    }
    t = PdfGenerator.fr(t, '%{ontvanger}\n', greeting);

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
    f = PdfGenerator.fr(f, '%{contractant1}\n', signee1.fullname());
    f = PdfGenerator.fr(f, '%{contractant1_functie}\n', signee1.function);
    f = PdfGenerator.fr(f, '%{contractant2}\n', signee2.fullname());
    f = PdfGenerator.fr(f, '%{contractant2_functie}\n', signee2.function);
    return f;
  }

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
    let totalPrice = 0;
    let mT = '';
    let dT = '';
    let fT = '';
    let prodInst: ProductInstance;
    for (let i = 0; i < products.length; i++) {
      prodInst = products[i];
      totalPrice += prodInst.basePrice - prodInst.discount;

      if (language === Language.DUTCH) {
        mT += `\\item{\\textbf{${prodInst.product.nameDutch} ${prodInst.product.description}}\\\\\n`;
        mT += `${prodInst.product.contractTextDutch}}\n`;

        if (prodInst.product.deliverySpecificationDutch !== '') {
          dT += `\\item{\\textbf{${prodInst.product.nameDutch}}\\\\\n`;
          dT += `${prodInst.product.deliverySpecificationDutch}}\n`;
        }

        fT += `${prodInst.product.nameDutch} ${prodInst.product.description} & ${Currency.priceAttributeToEuro(prodInst.basePrice, true)} \\\\\n`;
        if (prodInst.discount > 0) {
          fT += '- Korting ';
          if (showDiscountPercentages) {
            fT += `(${prodInst.discountPercentage()}\\%) `;
          }
          fT += `& -${Currency.priceAttributeToEuro(prodInst.discount, true)} \\\\\n`;
        }
      } else if (language === Language.ENGLISH) {
        mT += `\\item{\\textbf{${prodInst.product.nameEnglish} ${prodInst.product.description}}\\\\\n`;
        mT += `${prodInst.product.contractTextEnglish}}\n`;

        if (prodInst.product.deliverySpecificationEnglish !== '') {
          dT += `\\item{\\textbf{${prodInst.product.nameEnglish}}\\\\\n`;
          dT += `${prodInst.product.deliverySpecificationEnglish}}\n`;
        }

        fT += `${prodInst.product.nameEnglish} ${prodInst.product.description} & ${Currency.priceAttributeToEuro(prodInst.basePrice, false)} \\\\\n`;
        if (prodInst.discount > 0) {
          fT += '- Discount ';
          if (showDiscountPercentages) {
            fT += `(${prodInst.discountPercentage()}\\%) `;
          }
          fT += `& -${Currency.priceAttributeToEuro(prodInst.discount, false)} \\\\\n`;
        }
      }
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

    f = PdfGenerator.fr(f, '%{producten}', mT);
    f = PdfGenerator.fr(f, '%{aanleverspecificatie}', dT);
    f = PdfGenerator.fr(f, '%{tabelproducten}', fT);
    if (language === Language.DUTCH) {
      f = PdfGenerator.fr(f, '%{totaalprijs}\n', Currency.priceAttributeToEuro(totalPrice, true));
    } else if (language === Language.ENGLISH) {
      f = PdfGenerator.fr(f, '%{totaalprijs}\n', Currency.priceAttributeToEuro(totalPrice, false));
    }
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
      const tempFileLocation = this.saveFileToDisk(file, `${fileName}.tex`, this.workDir);
      result = await this.convertTexToPdf(tempFileLocation, `${fileName}.pdf`, saveToDisk);
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
    file = this.generateBaseTexLetter(file, contract.company, contract.contact, settings.sender,
      settings.language, false, contract.title, `C${contract.id}`);
    file = this.createProductTables(file, contract.products, settings.language,
      settings.showDiscountPercentages);
    file = this.createSignees(file, settings.signee1, settings.signee2);

    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }

  /**
   * Generate a PDF file based on an invoice.
   * @param invoice {Invoice} The invoice that will be generated
   * @param settings {InvoiceGenSettings} The corresponding generation settings
   * @returns {string} The absolute location of the generated file
   */
  public async generateInvoice(invoice: Invoice, settings: InvoiceGenSettings): Promise<string> {
    let templateLocation;
    if (settings.language === Language.DUTCH) {
      templateLocation = path.join(this.templateDir, invoiceDutch);
    } else if (settings.language === Language.ENGLISH) {
      templateLocation = path.join(this.templateDir, invoiceEnglish);
    }
    if (templateLocation == null) {
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language');
    }

    const useInvoiceAddress = invoice.company.invoiceAddressStreet !== ''
      && invoice.company.invoiceAddressPostalCode !== ''
      && invoice.company.invoiceAddressCity !== '';

    let file = fs.readFileSync(templateLocation).toString();
    // TODO: Give each invoice a title as well
    file = this.generateBaseTexLetter(file, invoice.company, settings.recipient, settings.sender,
      settings.language, useInvoiceAddress, '', `F${invoice.id}`, invoice.poNumber);
    file = this.createProductTables(file, invoice.products, settings.language,
      settings.showDiscountPercentages);

    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }
}
