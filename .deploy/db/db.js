const PWD = "$2b$10$aWmoLFvjIcfS1rZJGzSBue43QRHy5LaKzYjCyz3gQamw0FR5pGTMC"; // passwords is "111"
db.users.find().forEach(function(doc) {
  const emails = doc.emails;
  if (emails && emails[0]) {
    emails[0].address = emails[0].address.replace("@", "@test.");
  }
  if (emails && emails.address) {
    emails.address = emails.address.replace("@", "@test.");
  }

  const setter = {
    "services.password.bcrypt": PWD,
    "emails": emails
  }
  if (doc && doc.status && doc.status.lastLogin && doc.status.lastLogin.ipAddr ) {
    Object.assign(setter,{"status.lastLogin.ipAddr": "127.0.0.1"});
  }

  if (doc && doc.services && doc.services.resume && doc.services.resume.loginTokens) {
    Object.assign(setter,{"services.resume.loginTokens": []});
  }

  db.users.update({_id: doc._id}, {$set: setter});
});
