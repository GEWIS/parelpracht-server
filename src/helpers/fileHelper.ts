import { Controller } from 'tsoa';
import * as fs from 'fs';
import mime from 'mime';
import path from 'path';
import BaseFile from '../entity/file/BaseFile';

export const workDirLoc = 'tmp/';
export const generateDirLoc = 'data/generated/';
export const uploadDirLoc = 'data/uploads/';
export const templateDirLoc = 'data/templates/';

export default class FileHelper {
  public static putFileInResponse(
    controller: Controller, file: BaseFile,
  ): fs.ReadStream {
    const stat = fs.statSync(file.location);

    controller.setStatus(200);
    controller.setHeader('Content-Type', mime.getType(file.location)!);
    controller.setHeader('Content-Length', stat.size.toString());
    controller.setHeader('Content-Disposition', `attachment; filename="${path.basename(file.location)}"`);
    controller.setHeader('Content-Disposition', `attachment; filename="${file.downloadName}"`);

    return fs.createReadStream(file.location);
  }

  public static diskLocToWebLoc(diskLoc: string): string {
    const rootDir = path.join(__dirname, '/../../');
    let relDir = diskLoc.substring(rootDir.length);
    relDir = relDir.replace('\\', '/');
    return `/${relDir.replace('\\', '/')}`;
  }

  public static fileLocationToExtension(location: string): string {
    const parts = location.split('.');
    return `${parts[parts.length - 1]}`;
  }

  public static removeFileLoc(fileLocation: string) {
    try {
      fs.unlinkSync(fileLocation);
    } catch (e) {
      console.log(`File at ${fileLocation} does not exist, so could not be removed`);
    }
  }

  public static removeFile(file: BaseFile) {
    try {
      fs.unlinkSync(file.location);
    } catch (e) {
      console.log(`File ${file.name} at ${file.location} does not exist, so could not be removed`);
    }
  }
}
