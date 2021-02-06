export default class Currency {
  public static priceAttributeToEuro(price: number, comma: boolean): string {
    const result = (Math.round(price) / 100).toFixed(2);
    if (comma) return result.replace('.', ',');
    return result;
  }
}
