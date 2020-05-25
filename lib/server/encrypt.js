import crypto from "crypto";

const algorithm = "aes-256-ctr";
const password = "q7TEGPrNAy6ULPUJJAJh8u9hb25aVKtY";
const noidea = "qTGrA6LUJJ89b5Vt";
const IV = Buffer.from(noidea);
/**
 *
 * @param {string} text
 * @returns {string} Encrypted text
 */
const encrypt = function(text) {
  var cipher = crypto.createCipheriv(algorithm, password, IV);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

/**
 *
 * @param {string} text
 * @returns {string} Decrypted text
 */
const decrypt = function(text) {
  var cipher = crypto.createDecipheriv(algorithm, password, IV);
  var decrypted = cipher.update(text, "hex", "utf8");
  decrypted += cipher.final("utf8");
  return decrypted;
};

export { encrypt, decrypt };
