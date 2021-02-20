import Mail from 'nodemailer/lib/mailer';
import { User } from '../../entity/User';
import { Invoice } from '../../entity/Invoice';


export const newInvoice = (receiver: User, invoice: Invoice ): Mail.Options => ({
  subject: 'New Invoice F${invoice.id} - ParelPracht',
  to: receiver.email,
  from: process.env.MAIL_FROM,
  html: `
    <p>Dear ${receiver.firstName}, <br/><br/>
      An invoice has just been created in ParelPracht.<br/>
      The invoice ID is F${invoice.id}, and was sent by ${invoice.createdBy.firstName} to ${invoice.company}.
      For any questions about the invoice, you can email ${invoice.createdBy.firstName} at ${invoice.createdBy.email}.

      At your convenience you can redirect yourself to ParelPracht by using the following link: <a href="parelpracht.gewis.nl">parelpracht.gewis.nl</a>.<br/><br/>

      We wish you best of luck with all your future endeavours for our beautiful association.<br>
      </p>

      <table style="width: 100%; max-width: 24em;">
        <tbody>
            <tr>
                <td colspan="3">
                    <p style="padding-bottom: 1em;">
                        With kind regards,
                    </p>
                </td>
            </tr>
            <tr style="vertical-align: top;">
                <td rowspan=2>
                    <div style="border-right: 2px solid black; margin-right: 10px;">
              <div style="margin-right:10px;">
                <img style="width: 45px; height: 90px;" src="https://gewis.nl/corporateidentity/public/logo/Base_Logo_Colour.png" alt="Logo" width="45" height="90"/>
              </div>
                    </div>
                </td>

                <td colspan=2>
                    <b>The 39th board of GEWIS</b><br />
                    <i>The amazing creators of ParelPracht</i>
                    <br />
                </td>
            </tr>
            <tr style="vertical-align: bottom;">
                <td style="width: 50%;">
                    <a style="text-decoration: none; color: #D40000;" href="mailto:best2021@gewis.nl">best2021@gewis.nl</a> <br>
                    <a style="text-decoration: none; color: #D40000;" href="https://www.gewis.nl/">www.gewis.nl</a>
                </td>
                <td style="width: 50%; color: #D40000;">
            <div style="border-left: 2px solid black;">
              <div style="margin-left: 10px;">
                <span style="text-decoration: none;">&#43;31 40 247 2815</span> <br>
                <span style="text-decoration: none;">TU Eindhoven</span>
              </div>
            </div>
                </td>
            </tr>
        </tbody>
    </table>
  `,
});
