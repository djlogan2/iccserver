import { Meteor } from "meteor/meteor";

import mongoClientInternationalization from "../../collections/clientInternationalization";
import { english } from "../../../server/defaultInternationalization/english";
import { russian } from "../../../server/defaultInternationalization/russian";
import { japanese } from "../../../server/defaultInternationalization/japanese";

export default function firstRunClientInternationalization() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  if (!mongoClientInternationalization.find({ locale: "en-us" }).count()) {
    mongoClientInternationalization.insert({ locale: "en-us", i18n: english });
  }

  if (!mongoClientInternationalization.find({ locale: "ru-ru" }).count()) {
    mongoClientInternationalization.insert({ locale: "ru-ru", i18n: russian });
  }

  if (!mongoClientInternationalization.find({ locale: "ja" }).count()) {
    mongoClientInternationalization.insert({ locale: "ja", i18n: japanese });
  }
}
