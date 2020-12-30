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

    t = t.replace('%{contactperson}\n', recipient.fullname());
    t = t.replace('%{contactperson}\n', recipient.fullname());
    t = t.replace('%{sender}\n', sender.fullname());
    t = t.replace('%{sender}\n', sender.fullname());
    t = t.replace('%{senderfunctie}\n', sender.function);
    t = t.replace('%{company}\n', company.name);
    t = t.replace('%{subject}\n', subject);
    t = t.replace('%{ourreference}', ourReference);
    t = t.replace('%{ourreference}', ourReference);
    t = t.replace('%{yourreference}', theirReference);
    t = t.replace('%{senderemail}\n', sender.email);
    t = t.replace('%{senderemail}\n', sender.email);

    if (useInvoiceAddress) {
      t = t.replace('%{street}\n', company.invoiceAddressStreet!);
      t = t.replace('%{postalcode}\n', company.invoiceAddressPostalCode!);
      t = t.replace('%{city}\n', company.invoiceAddressCity!);
      t = t.replace('%{country}\n', company.invoiceAddressCountry!);
    } else {
      t = t.replace('%{street}\n', company.addressStreet);
      t = t.replace('%{postalcode}\n', company.addressPostalCode!);
      t = t.replace('%{city}\n', company.addressCity!);
      t = t.replace('%{country}\n', company.addressCountry!);
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
    t = t.replace('%{ontvanger}\n', greeting);

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
    f = f.replace('%{contractant1}\n', signee1.fullname());
    f = f.replace('%{contractant1}\n', signee1.fullname());
    f = f.replace('%{contractant1_functie}\n', signee1.function);
    f = f.replace('%{contractant2}\n', signee2.fullname());
    f = f.replace('%{contractant2}\n', signee2.fullname());
    f = f.replace('%{contractant2_functie}\n', signee2.function);
    return f;
  }

  /**
   * Replace the product placeholders in the .tex file with the actual products
   * @param file {string} The .tex file parsed as a string
   * @param products {Array<ProductInstance>} List of products that should be in the letter
   * @param language {Language} Language of the letter
   * @returns {string} The letter with all product information added
   */
  private createProductTables(file: string, products: ProductInstance[], language: Language) {
    let f = file;
    let totalPrice = 0;
    let mainTable = '';
    let deliveryTable = '';
    let financesTable = '';
    let productInstance: ProductInstance;
    for (let i = 0; i < products.length; i++) {
      productInstance = products[i];
      totalPrice += productInstance.price;

      if (language === Language.DUTCH) {
        mainTable += `\\item{\\textbf{${productInstance.product.nameDutch} ${productInstance.product.description}}\\\\\n`;
        mainTable += `${productInstance.product.contractTextDutch}}\n`;

        if (productInstance.product.deliverySpecificationDutch !== '') {
          deliveryTable += `\\item{\\textbf{${productInstance.product.nameDutch}}\\\\\n`;
          deliveryTable += `${productInstance.product.deliverySpecificationDutch}}\n`;
        }

        financesTable += `${productInstance.product.nameDutch} ${productInstance.product.description} & ${Currency.priceAttributeToEuro(productInstance.price, true)} \\\\\n`;
      } else if (language === Language.ENGLISH) {
        mainTable += `\\item{\\textbf{${productInstance.product.nameEnglish} ${productInstance.product.description}}\\\\\n`;
        mainTable += `${productInstance.product.contractTextEnglish}}\n`;

        if (productInstance.product.deliverySpecificationEnglish !== '') {
          deliveryTable += `\\item{\\textbf{${productInstance.product.nameEnglish}}\\\\\n`;
          deliveryTable += `${productInstance.product.deliverySpecificationEnglish}}\n`;
        }

        financesTable += `${productInstance.product.nameEnglish} ${productInstance.product.description} & ${Currency.priceAttributeToEuro(productInstance.price, false)} \\\\\n`;
      }
    }

    if (deliveryTable !== '') {
      if (language === Language.DUTCH) {
        deliveryTable = `\\subsection{Aanleverspecificatie}\n
          \\begin{itemize}\n
          ${deliveryTable}\n
          \\end{itemize}`;
      } else if (language === Language.ENGLISH) {
        deliveryTable = `\\subsection{Delivery specifications}\n
          \\begin{itemize}\n
          ${deliveryTable}\n
          \\end{itemize}`;
      }
    }

    f = f.replace('%{producten}', mainTable);
    f = f.replace('%{aanleverspecificatie}', deliveryTable);
    f = f.replace('%{tabelproducten}', financesTable);
    if (language === Language.DUTCH) {
      f = f.replace('%{totaalprijs}\n', Currency.priceAttributeToEuro(totalPrice, true));
      f = f.replace('%{totaalprijs}\n', Currency.priceAttributeToEuro(totalPrice, true));
    } else if (language === Language.ENGLISH) {
      f = f.replace('%{totaalprijs}\n', Currency.priceAttributeToEuro(totalPrice, false));
      f = f.replace('%{totaalprijs}\n', Currency.priceAttributeToEuro(totalPrice, false));
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
    file = this.createProductTables(file, contract.products, settings.language);
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
      settings.language, useInvoiceAddress, `F${invoice.id}`);
    file = this.createProductTables(file, invoice.products, settings.language);

    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }
}
