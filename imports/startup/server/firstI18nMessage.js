import { i18nCollectionMessageDoc } from "./../../collections/i18nCollectionMessageDoc";
import i18nCollection from "./../../collections/i18n";
import { Meteor } from "meteor/meteor";
export default function firstAddI18nMessage() {
  if (
    !Meteor.isTest &&
    !Meteor.isAppTest &&
    i18nCollection.find().count() === 0
  ) {
    i18nCollectionMessageDoc.forEach(i18nMessage => {
      i18nCollection.insert(i18nMessage);
    });
  }
}
