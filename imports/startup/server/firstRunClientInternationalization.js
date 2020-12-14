import { Meteor } from "meteor/meteor";

import mongoClientInternationalization from "../../collections/clientInternationalization";
import { english } from "../../../server/defaultInternationalization/english";

export default function firstRunClientInternationalization() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  if (!mongoClientInternationalization.find({ locale: "en-us" }).count()) {
    mongoClientInternationalization.insert({ locale: "en-us", i18n: english });
  }
}
