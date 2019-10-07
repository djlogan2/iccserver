import { encrypt, decrypt } from "./encrypt";
import chai from "chai";

describe("Encrypt and decrypt", function() {
  it("should correctly decrypt an encrypted string", function() {
    const string = "Hello, this is a string!";
    const encrypted = encrypt(string);
    const decrypted = decrypt(encrypted);
    chai.assert.equal(string, decrypted);
  });
});
