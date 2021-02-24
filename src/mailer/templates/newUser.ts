import Mail from 'nodemailer/lib/mailer';
import { User } from '../../entity/User';

export const newUser = (user: User, resetLink: string): Mail.Options => ({
  subject: 'Your account has been created - ParelPracht',
  to: user.email,
  from: process.env.MAIL_FROM,
  html: `
    <p>Dear ${user.firstName}, <br/><br/>
      An account has been created for you in ParelPracht, the Customer Relationship Managment system of study association GEWIS.<br/>
      This email address (${user.email}) will be your username.<br/>
      Follow <a href=${resetLink}>this link</a> to set your password and start using ParelPracht.
      The link expires in 7 days.<br/><br/>

      In the future you can access ParelPracht by going to <a href="parelpracht.gewis.nl">parelpracht.gewis.nl</a>. For any questions, we suggest you to get in contact with the External Affairs Officer of GEWIS, who can be reached by emailing to <a href="mailto:ceb@gewis.nl">ceb@gewis.nl</a>.<br/><br/>

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
