import { FS } from "meteor/cfs:base-package";

const MugshotCollection = new FS.Collection("mugshots", {
  stores: [new FS.Store.FileSystem("mugshots", { path: "uploads/mugshots" })],
});

export default MugshotCollection;
