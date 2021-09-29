import { Meteor } from "meteor/meteor";

export default function firstRunStatics() {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    // const default_mugshot = SystemConfiguration.find({ item: "default_mugshot" }).count();
    // if (!default_mugshot) {
    //   SystemConfiguration.insert({ item: "default_mugshot", value: "images/avatar.png" });
    // }
  }
}
