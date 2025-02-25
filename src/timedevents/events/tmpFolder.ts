import * as fs from 'fs';
import path from 'path';
import { rimraf } from 'rimraf';

export default async function tmpFolder() {
  console.log('Remove temp folder...');
  await rimraf(path.join(__dirname, '../../../tmp'));
  console.log('Folder deleted');
  fs.mkdirSync(path.join(__dirname, '../../../tmp'));
  console.log('Removed and recreated a new "tmp" folder for temporary files');
}
