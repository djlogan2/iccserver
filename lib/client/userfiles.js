import { Meteor } from "meteor/meteor";
import { Logger } from "./Logger";
import { FilesCollection } from "meteor/ostrio:files";

const logger = new Logger("client/userfiles_js");

export const PublicAssets = new FilesCollection({
  collectionName: "PublicAssets",
  allowClientCode: false, // Disallow remove files from Client
  allowedOrigins: /(.*chessclub.com.*)|(.*localhost.*)/,
  allowQueryStringCookies: true,
  onBeforeUpload(file) {
    logger.debug("onBeforeUpload", file);
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760) {
      return true;
    }
    return "Please upload asset, with size equal or less than 10MB";
  },
});

export const Mugshots = new FilesCollection({
  collectionName: "Mugshots",
  allowClientCode: false,
  allowedOrigins: /(.*chessclub.com.*)|(.*localhost.*)/,
  allowQueryStringCookies: true,
  onBeforeUpload(file) {
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    return "Please upload image, with size equal or less than 10MB";
  },
});
