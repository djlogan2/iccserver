import { Meteor } from "meteor/meteor";

import mongoClientInternationalization from "../../collections/clientInternationalization";
import { english } from "../../../server/defaultInternationalization/english";
import { isEqual } from "lodash";

export default function firstRunClientInternationalization() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }
  const data = mongoClientInternationalization.find({ locale: "en-us" });

  if (!data.count()) {
    mongoClientInternationalization.insert({ locale: "en-us", i18n: english });
  } else if (!isEqual(data.fetch()[0]["i18n"], english)) {
    mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
  }
}
