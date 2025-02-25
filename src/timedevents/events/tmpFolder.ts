import * as fs from 'fs';
import { rimraf } from 'rimraf';
import path from 'path';

export default async function tmpFolder() {
  console.log('Remove temp folder...');
  await rimraf(path.join(__dirname, '../../../tmp'));
  console.log('Folder deleted');
  fs.mkdirSync(path.join(__dirname, '../../../tmp'));
  console.log('Removed and recreated a new "tmp" folder for temporary files');
}
