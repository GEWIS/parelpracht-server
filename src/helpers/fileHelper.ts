import * as fs from 'fs';
import path from 'path';
import mime from 'mime';
import BaseFile from '../entity/file/BaseFile';
import { Controller } from 'tsoa';

export const workDirLoc = 'tmp/';
export const generateDirLoc = 'data/generated/';
export const uploadDirLoc = 'data/uploads/';
export const templateDirLoc = 'templates/';
export const uploadCompanyLogoDirLoc = 'data/logos';
export const uploadUserAvatarDirLoc = 'data/logos';
export const uploadUserBackgroundDirLoc = 'data/backgrounds';

export default class FileHelper {
  /**
   * Add the file to the response object, given the controller that handles the request
   * @param controller Controller that handles the request
   * @param file File to add to the response
   */
  public static putFileInResponse(controller: Controller, file: BaseFile): fs.ReadStream {
    const stat = fs.statSync(file.location);

    controller.setStatus(200);
    controller.setHeader('Content-Type', mime.getType(file.location)!);
    controller.setHeader('Content-Length', stat.size.toString());
    controller.setHeader('Content-Disposition', `attachment; filename="${path.basename(file.location)}"`);
    controller.setHeader('Content-Disposition', `attachment; filename="${file.downloadName}"`);

    return fs.createReadStream(file.location);
  }

  /**
   * Convert the location on the disk to a HTTP url the user can access
   * @param diskLoc Location of a file on the disk
   */
  public static diskLocToWebLoc(diskLoc: string): string {
    const rootDir = path.join(__dirname, '/../../');
    let relDir = diskLoc.substring(rootDir.length);
    relDir = relDir.replace('\\', '/');
    return `/${relDir.replace('\\', '/')}`;
  }

  /**
   * Get the extension of a file, given its (absolute) location or filename
   * @param location
   */
  public static fileLocationToExtension(location: string): string {
    const parts = location.split('.');
    return `${parts[parts.length - 1]}`;
  }

  /**
   * Remove the file attached to a file object
   * @param file File to remove
   */
  public static removeFile(file: BaseFile) {
    try {
      fs.unlinkSync(file.location);
    } catch (e) {
      console.log(`File ${file.name} at ${file.location} does not exist, so could not be removed`);
    }
  }

  /**
   * Remove a file, given the absolute location
   * @param location Absolute location of the file
   */
  public static removeFileAtLoc(location: string) {
    try {
      fs.unlinkSync(location);
    } catch (e) {
      console.log(`File ${location} does not exist, so could not be removed`);
    }
  }
}
