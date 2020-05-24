import SimpleSchema from "simpl-schema";

export const ChatSchema = new SimpleSchema({
  game_id:{
    type: String,
    optional: false
  },
  issuer: {
    type: String,
    optional: true
  },
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
  groups: {type: Array, defaultValue: [] },
    "groups.$": String,
  restricted: {
    type: Boolean,
    optional: true,
  },
  role: {
    type: String,
    optional: true
  }
});