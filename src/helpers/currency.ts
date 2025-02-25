import { Language } from '../entity/enums/Language';

export default class Currency {
  public static priceAttributeToEuro(price: number, language: Language): string {
    let locale;
    switch (language) {
      case Language.DUTCH:
        locale = 'nl-NL';
        break;
      case Language.ENGLISH:
        locale = 'nl-NL';
        break;
      default:
        throw new TypeError(`Unknown language: ${language}`);
    }

    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(price / 100);
  }
}
