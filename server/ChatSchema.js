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
      "whisper"
    ],
    optional: true
  },
  what: {
    type: String,
    optional: true

  },
  role: {
    type: String,
    optional: true
  }
});