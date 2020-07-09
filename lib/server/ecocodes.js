import { Game } from "../../server/Game";

class Ecocodes {
}

if (!global._ecocodesObject) {
  global._ecocodesObject = new Ecocodes();
}

module.exports.Ecocodes = global._ecocodesObject;
