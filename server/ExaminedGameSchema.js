import SimpleSchema from "simpl-schema";

function parameterCheck() {
  const parameter = this.field("parameter");
  const nope = [
    {
      name: "parameter",
      type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
      value: parameter.value
    }
  ];

  switch (this.field("type")) {
    case "move":
    case "kibitz":
    case "whisper":
      if (!parameter.isSet || typeof parameter.value !== "string") return nope;
      else return;
    case "move_backward":
    case "move_forward":
      if (parameter.isSet && parameter.value === parseInt(parameter.value))
        return;
      else return nope;
    default:
      if (parameter.isSet) return nope;
  }
}

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
    type: SimpleSchema.oneOf(String, Number),
    optional: true,
    custom: parameterCheck
  }
});

export const ExaminedGameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  result: String,
  legacy_game_number: {
    type: Number,
    required: false,
    custom() {
      if (
        this.field("legacy_game_number").isSet !==
        this.field("legacy_game_id").isSet
      )
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
      if (
        this.field("legacy_game_number").isSet !==
        this.field("legacy_game_id").isSet
      )
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
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number
    }),
    black: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number
    })
  }),
  white: new SimpleSchema({
    name: String,
    rating: SimpleSchema.Integer
  }),
  black: new SimpleSchema({
    name: String,
    rating: SimpleSchema.Integer
  }),
  tags: { type: Object, required: false },
  actions: [actionSchema],
  observers: { type: Array, defaultValue: [] },
  "observers.$": String,
  examiners: { type: Array, defaultValue: [] },
  "examiners.$": String
});
