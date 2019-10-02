import { systemcss, usercss } from "../../../server/developmentcss";
import mongoCss from "../../collections/css";

export default function firstRunCSS() {
  if (mongoCss.find().count() === 0) {
    mongoCss.insert(systemcss);
    mongoCss.insert(usercss);
  }
}
