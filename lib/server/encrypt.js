import crypto from "crypto";

const algorithm = 'aes-256-ctr';
const password = '"GMzrADTm^2EV,5P';

/**
 *
 * @param {string} text
 * @returns {string} Encrypted text
 */
const encrypt = function(text) {
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

/**
 *
 * @param {string} text
 * @returns {string} Decrypted text
 */
const decrypt = function(text) {
    var cipher = crypto.createDecipher(algorithm,password);
    var decrypted = cipher.update(text,'hex','utf8');
    decrypted += cipher.final('utf8');
    return decrypted;
};

export { encrypt, decrypt }
