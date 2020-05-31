import SimpleSchema from "simpl-schema";

export const ChatSchema = new SimpleSchema({
  game_id:{        // When it's just a type, you can abbreviate these:  game_id: String,
    type: String,
    optional: false
  },
  issuer: {
    type: String,
    optional: true // DDD: Um no, not optional
  },
  // DDD: Why have type here? You have "kibitz", "child_chat", and "child_chat_exempt" alread
  //      as fields. I assume this is unneeded, and I am assuming you are no longer using it.
  type: {
    type: String,
    allowedValues: [
      "move",
      "kibitz",
      "whisper",
      "child_chat_kibitz",
      "child_chat_exempt_kibitz",
    ],
    optional: true
  },
  //
  // DDD: Same thing here, yes? kibitz=true or kibitz=false means we don't need this?
  //
  what: {
    type: String,
    optional: true

  },
  kibitz: {
    type: Boolean,
    optional: true
  },
  child_chat: {
    type: Boolean,
    optional: true
  },
  child_chat_exempt: {
    type: Boolean,
    optional: true
  },
  //
  // DDD: Remove both groups and restricted, this is being rewritten.
  //
  groups: {type: Array, defaultValue: [] },
    "groups.$": String,
  restricted: {
    type: Boolean,
    optional: true,
  },
  //
  // DDD: What is this?
  //
  role: {
    type: String,
    optional: true
  }
});
