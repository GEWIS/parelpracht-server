// eslint-disable-next-line import/no-cycle
import UserService from '../services/UserService';
// eslint-disable-next-line import/no-cycle
import InvoiceService from '../services/InvoiceService';
import { Roles } from '../entity/enums/Roles';
import { Mailer } from '../mailer/Mailer';
import { newInvoice } from '../mailer/templates/newInvoice';

/**
 * Send an email to all treasurers that a new invoice has been sent to a company
 * @param invoiceId ID of the invoice
 */
export const sendInvoiceEmails = async (invoiceId: number) => {
  const treasurers = await new UserService().getTreasurersToSendEmail();
  const invoice = await new InvoiceService().getInvoice(invoiceId, ['createdBy']);
  const mailer = Mailer.getInstance();

  const promises: Promise<void>[] = [];
  treasurers.forEach((t) => {
    if (t.hasRole(Roles.FINANCIAL)) {
      promises.push(mailer.send(newInvoice(t, invoice)));
    }
  });

  await Promise.all(promises);
};
