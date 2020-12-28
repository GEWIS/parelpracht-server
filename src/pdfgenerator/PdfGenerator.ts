import * as fs from 'fs-extra';
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
import { User } from '../entity/User';

let workDir = '/../../tmp/';
let saveDir = '/../../data/generated/';
let initialized = false;

const contractDutch = 'template_contract.tex';
const contractEnglish = 'template_contract_engels.tex';
const proposalDutch = 'template_factuur.tex';
const proposalEnglish = 'template_factuur_engels.tex';
const invoiceDutch = 'template_sponsorvoorstel.tex';
const invoiceEnglish = 'template_sponsorvoorstel_engels.tex';

export default class PdfGenerator {
  static initialize() {
    if (initialized) throw new Error('PdfGenerator already initialized');

    workDir = path.join(__dirname, workDir);
    saveDir = path.join(__dirname, saveDir);

    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir);
    }

    fs.copySync(path.join(__dirname, '/../../data/templates/'), workDir, { overwrite: true });

    initialized = true;
  }

  private saveFileToDisk(file: string, fileName: string, directory: string): string {
    const loc = path.join(directory, fileName);
    fs.writeFileSync(loc, file);
    return loc;
  }

  private async convertTexToPdf(fileLocation: string, fileName: string, saveToDisk: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = fs.createReadStream(fileLocation);
      let outputLoc: string;
      if (saveToDisk) {
        outputLoc = path.join(saveDir, fileName);
      } else {
        outputLoc = path.join(workDir, fileName);
      }
      const output = fs.createWriteStream(outputLoc);
      const pdf = latex(input, { inputs: path.join(saveDir, '/../templates/') });
      pdf.pipe(output);
      pdf.on('error', (err) => reject(err));
      pdf.on('finish', () => resolve(outputLoc));
    });
  }

  private generateBaseTexLetter(
    template: string, company: Company, recipient: Contact, sender: User,
    useInvoiceAddress: boolean, subject: string, ourReference: string = '', theirReference: string = '',
  ): string {
    let t = template;

    t = t.replace('%{contactperson}', recipient.fullname());
    t = t.replace('%{sender}', sender.fullname());
    t = t.replace('%{company}', company.name);
    t = t.replace('%{subject}', subject);
    t = t.replace('%{ourreference}', ourReference);
    t = t.replace('%{yourreference}', theirReference);
    if (useInvoiceAddress) {
      t = t.replace('%{street}', company.invoiceAddressStreet!);
      t = t.replace('%{postalcode}', company.invoiceAddressPostalCode!);
      t = t.replace('%{city}', company.invoiceAddressCity!);
      t = t.replace('%{country}', company.invoiceAddressCountry!);
    } else {
      t = t.replace('%{street}', company.addressStreet);
      t = t.replace('%{postalcode}', company.addressPostalCode!);
      t = t.replace('%{city}', company.addressCity!);
      t = t.replace('%{country}', company.addressCountry!);
    }

    return t;
  }

  private async finishFileGeneration(
    file: string, fileType: ReturnFileType, saveToDisk: boolean,
  ): Promise<string> {
    let result = '';
    let fileName = uuidv4();

    if (fileType === ReturnFileType.TEX) {
      fileName += '.tex';
      if (saveToDisk) {
        result = this.saveFileToDisk(file, fileName, saveDir);
      } else {
        result = this.saveFileToDisk(file, fileName, workDir);
      }
    }

    if (fileType === ReturnFileType.PDF) {
      const tempFileLocation = this.saveFileToDisk(file, `${fileName}.tex`, workDir);
      result = await this.convertTexToPdf(tempFileLocation, `${fileName}.pdf`, saveToDisk);
    }

    return result;
  }

  public async generateContract(
    contract: Contract, settings: ContractGenSettings,
  ): Promise<string> {
    let templateLocation;
    if (settings.language === Language.DUTCH) {
      if (settings.contentType === ContractType.CONTRACT) {
        templateLocation = path.join(workDir, contractDutch);
      } else if (settings.contentType === ContractType.PROPOSAL) {
        templateLocation = path.join(workDir, proposalDutch);
      }
    } else if (settings.language === Language.ENGLISH) {
      if (settings.contentType === ContractType.CONTRACT) {
        templateLocation = path.join(workDir, contractEnglish);
      } else if (settings.contentType === ContractType.PROPOSAL) {
        templateLocation = path.join(workDir, proposalEnglish);
      }
    }
    if (templateLocation == null) {
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language or content type');
    }

    let file = fs.readFileSync(templateLocation).toString();
    file = this.generateBaseTexLetter(file, contract.company, contract.contact, settings.sender,
      false, contract.title, `C${contract.id}`);

    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }

  public async generateInvoice(invoice: Invoice, settings: InvoiceGenSettings): Promise<string> {
    let templateLocation;
    if (settings.language === Language.DUTCH) {
      templateLocation = path.join(workDir, invoiceDutch);
    } else if (settings.language === Language.ENGLISH) {
      templateLocation = path.join(workDir, invoiceEnglish);
    }
    if (templateLocation == null) {
      throw new ApiError(HTTPStatus.BadRequest, 'Unknown language');
    }

    let file = fs.readFileSync(templateLocation).toString();
    // TODO: Give each invoice a title as well
    file = this.generateBaseTexLetter(file, invoice.company, settings.recipient, settings.sender,
      false, '', `F${invoice.id}`);

    return this.finishFileGeneration(file, settings.fileType, settings.saveToDisk);
  }
}
