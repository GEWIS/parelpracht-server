/**
 * Replace all occurences of the "from" string with the "to" string in the "src" string
 * @param src {string} Source
 * @param from {string} String to replace
 * @param to {string} To replace all with
 */
export default function replaceAll(src: string, from: string, to: string) {
  let src2 = src;
  const fromAll = [from];

  // If there is a newline symbol in the string (\n), replace them all with the Windows
  // newline symbol (\r\n)
  const newLines = (from.match(/\n/g) || []).length;
  if (newLines > 0) {
    fromAll.push(from.replace('\n', '\r\n'));
  }
  for (let i = 0; i < newLines - 1; i++) {
    fromAll[1] = fromAll[1].replace('\n', '\r\n');
  }

  for (let i = 0; i < fromAll.length; i++) {
    const count = (src.match(new RegExp(fromAll[i], 'g')) || []).length;
    for (let j = 0; j < count; j++) {
      src2 = src2.replace(fromAll[i], to);
    }
  }
  return src2;
}
