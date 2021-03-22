import { Mongo } from "meteor/mongo";
import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";

const log = new Logger("server/Singular_js");

class Singular {
  constructor() {
    this.collection = new Mongo.Collection("meteor_instances");
    this.my_ip = process.env.MY_IP_ADDRESS;
    this.tasklist = [];
    this.master = false;
    if (Meteor.isTest || Meteor.isAppTest) return;
    Meteor.startup(() => {
      //
      // If this is the first ever firing up of any server, add a bogus record
      // The interval below will make this guy the master in short order
      // (if he's the only one, or if he actually beats out another!)
      //
      if (!this.collection.find({ type: "master" }).count()) {
        this.collection.insert({
          type: "master",
          ip: "0.0.0.0",
          timestamp: new Date().getTime()
        });
      }

      this.interval = Meteor.setInterval(() => {
        const newMaster = {
          type: "master",
          ip: this.my_ip,
          timestamp: new Date().getTime()
        };
        const currentMaster = this.collection.findOne({ type: "master" });
        this.collection
          .rawCollection()
          .findAndModify(currentMaster, null, { $set: newMaster }, { new: true, update: true })
          .then(doc => {
            if (!!doc && !!doc.value && doc.value.ip === this.my_ip) {
              Meteor.clearInterval(this.interval);
              this.startMaster();
            }
          })
          .catch(e => {
            log.error("Error updating master record", e);
          });
      }, 5000);
    });
  }

  startMaster() {
    this.interval = Meteor.setInterval(() => {
      this.collection.update(
        { type: "master", ip: this.my_ip },
        { type: "master", ip: this.my_ip, timestamp: new Date().getTime() }
      );
    }, 1000);
    this.master = true;
    this.tasklist.forEach(func => func());
  }

  addTask(func) {
    this.tasklist.push(func);
    if (this.master) func();
  }
}

if (!global._singularObject) {
  global._singularObject = new Singular();
}

module.exports.Singular = global._singularObject;
