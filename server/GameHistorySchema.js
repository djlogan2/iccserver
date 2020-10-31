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
      "move_forward"
    ]
  },
  parameter: {
    type: SimpleSchema.oneOf(String, Number, Object),
    optional: true
  },
  "parameter.movecount": { type: Number, required: false },
  "parameter.variation": { type: Number, required: false },
  "parameter.move": { type: String, required: false },
  "parameter.what": { type: String, required: false }
});

export const GameHistorySchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  result: String,
  status2: Number,
  wild: Number,
  rating_type: String,
  rated: { type: Boolean, required: false },
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
    })
  },
  white: new SimpleSchema({
    name: String,
    id: String,
    rating: SimpleSchema.Integer
  }),
  black: new SimpleSchema({
    name: String,
    id: String,
    rating: SimpleSchema.Integer
  }),
  tags: { type: Object, required: false, blackbox: true },
  actions: [actionSchema],
  variations: { type: Object, required: false },
  "variations.movelist": Array,
  "variations.movelist.$": Object,
  "variations.ecocodes": { type: Array, required: false },
  "variations.ecocodes.$": Object,
  "variations.ecocodes.$.code": String,
  "variations.ecocodes.$.name": String,
  "variations.movelist.$.prev": { type: Number, required: false },
  "variations.movelist.$.move": { type: String, required: false },
  "variations.movelist.$.current": { type: Number, required: false },
  "variations.movelist.$.ecoindex": { type: Number, required: false },
  "variations.movelist.$.analysis": { type: Boolean, required: false },
  "variations.movelist.$.book": { type: Boolean, required: false },
  "variations.movelist.$.tablebase": { type: Boolean, required: false },
  "variations.movelist.$.variations": { type: Array, required: false },
  "variations.movelist.$.variations.$": Number,
  computer_variations: { type: Array, required: false },
  "computer_variations.$": Array,
  "computer_variations.$.$": Object,
  "computer_variations.$.$.depth": Number,
  "computer_variations.$.$.seldepth": Number,
  "computer_variations.$.$.time": Number,
  "computer_variations.$.$.nodes": Number,
  "computer_variations.$.$.nps": Number,
  "computer_variations.$.$.tbhits": Number,
  "computer_variations.$.$.score": Object,
  "computer_variations.$.$.score.unit": String,
  "computer_variations.$.$.score.value": Number,
  "computer_variations.$.$.pv": String,
  "computer_variations.$.$.multipv": Number
});
