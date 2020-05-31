import SimpleSchema from "simpl-schema";

const actionSchema = new SimpleSchema({
  time: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  issuer: String,
  type: {
    type: String,
    allowedValues: [
      "move",
      "kibitz",
      "child_chat_kibitz",
      "whisper",
      "disconnect",
      "connect",
      "adjourned",
      "resume_requested",
      "resume_declined",
      "resumed",
      "adjourn_requested",
      "adjourn_declined",
      "adjourn_accepted",
      "takeback_requested",
      "takeback_accepted",
      "takeback_declined",
      "draw",
      "draw_requested",
      "draw_accepted",
      "draw_declined",
      "resign",
      "abort_requested",
      "abort_accepted",
      "abort_declined",
      "move_backward",
      "move_forward",
      "draw_circle",
      "remove_circle",
      "draw_arrow",
      "remove_arrow",
      "draw_circle",
      "remove_circle",
      "clearboard",
      "initialposition",
      "addpiece",
      "removepiece",
      "settomove",
      "setcastling",
      "setenpassant",
      "settag",
      "loadfen"
    ]
  },
  parameter: {
    type: SimpleSchema.oneOf(String, Number, Object),
    optional: true
  },
  "parameter.movecount": { type: Number, required: false },
  "parameter.variation": { type: Number, required: false },
  "parameter.square": { type: String, required: false },
  "parameter.from": { type: String, required: false },
  "parameter.to": { type: String, required: false },
  "parameter.size": { type: Number, required: false },
  "parameter.color": { type: String, required: false },
  "parameter.piece": { type: String, required: false },
  "parameter.move": { type: String, required: false },
  "parameter.castling": { type: String, required: false },
  "parameter.fen": { type: String, required: false },
  "parameter.tag": { type: String, required: false },
  "parameter.value": { type: String, required: false },
  "parameter.lag": { type: Number, required: false },
  "parameter.ping": { type: Number, required: false },
  "parameter.gamelag": { type: Number, required: false },
  "parameter.gameping": { type: Number, required: false },
  "parameter.what": {type: String, required: false},
  "parameter.childChatId": {type: String, required: false}, // DDD: I prefer to have all lower case with optional underscores, so I prefer to have child_chat_id. Also, we need the text, but we don't need the id in the action array
  "parameter.childChatExemptText": {type: String, required: false}
});

export const ExaminedGameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  result: { type: String, allowedValues: ["0-1", "1-0", "1/2-1/2", "*"] },
  status2: { type: Number, required: false },
  owner: { type: String, required: false },
  private: { type: Boolean, required: false },
  requestors: { type: Array, required: false },
  "requestors.$": Object,
  "requestors.$.id": String,
  "requestors.$.username": String,
  "requestors.$.mid": String,
  analysis: { type: Array, required: false },
  "analysis.$": Object,
  "analysis.$.id": String,
  "analysis.$.username": String,
  deny_requests: { type: Boolean, required: false },
  deny_chat: { type: Boolean, required: false },
  fen: String,
  tomove: String,
  legacy_game_number: {
    type: Number,
    required: false,
    custom() {
      if (this.field("legacy_game_number").isSet !== this.field("legacy_game_id").isSet)
        return [
          {
            name: "legacy_game_number and legacy_game_id",
            type: SimpleSchema.ErrorTypes.REQUIRED
          }
        ];
    }
  },
  legacy_game_id: {
    type: String,
    required: false,
    custom() {
      if (this.field("legacy_game_number").isSet !== this.field("legacy_game_id").isSet)
        return [
          {
            name: "legacy_game_number and legacy_game_id",
            type: SimpleSchema.ErrorTypes.REQUIRED
          }
        ];
    }
  },
  wild: Number,
  rating_type: { type: String, required: false },
  rated: { type: Boolean, required: false },
  status: String,
  clocks: {
    type: new SimpleSchema({
      white: new SimpleSchema({
        initial: SimpleSchema.Integer,
        inc_or_delay: Number,
        delaytype: { type: String, allowedValues: ["none", "inc", "us", "bronstein"] }
      }),
      black: new SimpleSchema({
        initial: SimpleSchema.Integer,
        inc_or_delay: Number,
        delaytype: { type: String, allowedValues: ["none", "inc", "us", "bronstein"] }
      })
    }),
    required: false
  },
  white: new SimpleSchema({
    name: String,
    id: { type: String, required: false },
    rating: SimpleSchema.Integer
  }),
  black: new SimpleSchema({
    name: String,
    id: { type: String, required: false },
    rating: SimpleSchema.Integer
  }),
  tags: { type: Object, required: false, blackbox: true },
  circles: { type: Array, defaultValue: [] },
  "circles.$": Object,
  "circles.$.square": String,
  "circles.$.color": String,
  "circles.$.size": Number,
  arrows: { type: Array, defaultValue: [] },
  "arrows.$": Object,
  "arrows.$.from": String,
  "arrows.$.to": String,
  "arrows.$.color": String,
  "arrows.$.size": Number,
  actions: [actionSchema],
  observers: { type: Array, defaultValue: [] },
  "observers.$": Object,
  "observers.$.id": String,
  "observers.$.username": String,
  examiners: { type: Array, defaultValue: [] },
  "examiners.$": Object,
  "examiners.$.id": String,
  "examiners.$.username": String,
  variations: { type: Object, required: false },
  "variations.cmi": Number,
  "variations.movelist": Array,
  "variations.movelist.$": Object,
  "variations.movelist.$.prev": { type: Number, required: false },
  "variations.movelist.$.move": { type: String, required: false },
  "variations.movelist.$.nag": { type: String, required: false },
  "variations.movelist.$.comment": { type: String, required: false },
  "variations.movelist.$.current": { type: Number, required: false },
  "variations.movelist.$.score": { type: Number, required: false },
  "variations.movelist.$.variations": { type: Array, required: false },
  "variations.movelist.$.variations.$": Number
});
