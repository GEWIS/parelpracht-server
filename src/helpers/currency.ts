export default class Currency {
  /**
   * Convert an integer of eurocents to a parsed string in euros
   * @param price The price in cents
   * @param comma Whether the cents are after a comma or a dot
   */
  public static priceAttributeToEuro(price: number, comma: boolean): string {
    const result = (Math.round(price) / 100).toFixed(2);
    if (comma) return result.replace('.', ',');
    return result;
  }
}
