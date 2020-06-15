import { Meteor } from "meteor/meteor";
import React from "react";
import { FS } from "meteor/cfs:base-package";

const MugshotCollection = new FS.Collection("mugshots", {
  stores: [new FS.Store.FileSystem("mugshots", { path: "uploads/mugshots" })]
});

export default class DisplayMugshot extends React.Component {
  render() {
    <div />;
  }
}
