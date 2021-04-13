import axios from 'axios';
import ProductService from '../../services/ProductService';

export default async function directMail() {
  if (!process.env.DIRECTMAIL_URL
    || !process.env.DIRECTMAIL_USERNAME
    || !process.env.DIRECTMAIL_PASSWORD
    || !process.env.DIRECTMAIL_PRODUCT_ID
  ) {
    return;
  }

  await axios.get(process.env.DIRECTMAIL_URL, {
    auth: {
      username: process.env.DIRECTMAIL_USERNAME,
      password: process.env.DIRECTMAIL_PASSWORD,
    },
  }).then(async (response) => {
    const header = [['Name', 'Email', 'Students']];
    const parsedData: string[][] = response.data
      .map((d: any) => [d.description, d.eMail, d.noMembers]);
    await new ProductService().updatePricing(
      parseInt(process.env.DIRECTMAIL_PRODUCT_ID!, 10),
      {
        data: JSON.stringify(header.concat(parsedData)),
      },
    );
  }).catch((error) => {
    console.error(error);
  });
}
