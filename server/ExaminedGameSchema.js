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
      "remove_arrow"
    ]
  },
  parameter: {
    type: SimpleSchema.oneOf(String, Number, Object),
    optional: true
  },
  "parameter.movecount": { type: Number, required: false },
  "parameter.variation": { type: Number, required: false },
<<<<<<< HEAD
  "parameter.square": { type: String, required: false },
  "parameter.from": { type: String, required: false },
  "parameter.to": { type: String, required: false },
  "parameter.size": { type: Number, required: false },
  "parameter.color": { type: String, required: false }
=======
  "parameter.move": { type: String, required: false },
  "parameter.lag": { type: Number, required: false },
  "parameter.ping": { type: Number, required: false },
  "parameter.gamelag": { type: Number, required: false },
  "parameter.gameping": { type: Number, required: false }
>>>>>>> 4033f13da3852fe2d91b3209a9964241b1ed6d46
});

export const ExaminedGameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  result: String,
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
  "arrows.$.arrow": { type: Array, minCount: 2, maxCount: 2 },
  "arrows.$.arrow.$": String,
  "arrows.$.arrow.from": String,
  "arrows.$.arrow.to": String,
  "arrows.$.arrow.color": String,
  "arrows.$.arrow.size": Number,
  actions: [actionSchema],
  observers: { type: Array, defaultValue: [] },
  "observers.$": String,
  examiners: { type: Array, defaultValue: [] },
  "examiners.$": String,
  variations: { type: Object, required: false },
  "variations.cmi": Number,
  "variations.movelist": Array,
  "variations.movelist.$": Object,
  "variations.movelist.$.prev": { type: Number, required: false },
  "variations.movelist.$.move": { type: String, required: false },
  "variations.movelist.$.current": { type: Number, required: false },
  "variations.movelist.$.score": { type: Number, required: false },
  "variations.movelist.$.variations": { type: Array, required: false },
  "variations.movelist.$.variations.$": Number
});
