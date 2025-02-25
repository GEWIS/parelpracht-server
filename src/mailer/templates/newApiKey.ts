import Mail from 'nodemailer/lib/mailer';
import { User } from '../../entity/User';

export const newApiKey = (user: User, apiRevokeLink: string): Mail.Options => ({
  subject: 'A new API key was generated for your account - ParelPracht',
  to: user.email,
  from: process.env.MAIL_FROM,
  html: `
    <p>Dear ${user.firstName}, <br/><br/>
      A new API key has been created for your account. If you did not create this key, please revoke the key <a href=${apiRevokeLink}>here</a>.<br/><br/>

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
                    <b>ParelPracht</b>
                    <br />
                </td>
            </tr>
            <tr style="vertical-align: bottom;">
                <td style="width: 50%;">
                    <a style="text-decoration: none; color: #D40000;" href="mailto:parelpracht@gewis.nl">parelpracht@gewis.nl</a> <br>
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
