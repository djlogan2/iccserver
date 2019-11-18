import SimpleSchema from "simpl-schema";

const OneColorPendingSchema = new SimpleSchema({
  draw: String,
  abort: String,
  adjourn: String,
  takeback: Object,
  "takeback.number": Number,
  "takeback.mid": String
});

const PendingSchema = new SimpleSchema({
  white: OneColorPendingSchema,
  black: OneColorPendingSchema
});

const actionSchema = new SimpleSchema({
  // TODO: I don't think we are going to be able to use new Date() as an autovalue for this. I think we are going
  //       going to have to use some type of normal integer/long (millisecond since start of game or millisecond
  //       since last action) type of thing. Why? Because we are going to have to deal with lag. lag is subtracted
  //       from the users time to take a move. Well, that means we can't use new Date(). We have to save some type
  //       of number that can be adjusted for the current users lag.
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
      "move", // Obviously a normal move
      "kibitz", // A kibitz
      "whisper", // A whisper
      "disconnect", // When a user disconnects during a game, or disconnects while this game is adjourned
      "connect", // When a user reconnects while this game is adjourned (we can see how many sessions we have had with this game adjourned, and comparing it to his opponent, we can see how many opportunities there were to resume.)
      "adjourned", // When the game is adjourned, either by accepting, or by a disconnect adjourn
      "resume_requested", // When one player offers to resume the game
      "resume_declined", // When the other player explicitly declines
      "resumed", // Obviously, resumed
      "adjourn_requested", // When an adjourn is requested
      "adjourn_declined", // and declined
      "adjourn_accepted", // and accpted
      "takeback_requested", // etc.
      "takeback_accepted",
      "takeback_declined",
      "draw",
      "draw_requested",
      "draw_accepted",
      "draw_declined",
      "resign",
      "abort_requested",
      "abort_accepted",
      "abort_declined"
    ]
  },
  parameter: {
    type: SimpleSchema.oneOf(String, Number),
    optional: true
  }
});

export const PlayedGameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  pending: PendingSchema,
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
  rating_type: String,
  rated: Boolean,
  status: String,
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number,
      current: SimpleSchema.Integer
    }),
    black: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number,
      current: SimpleSchema.Integer
    })
  }),
  white: new SimpleSchema({
    name: String,
    id: {
      type: String,
      required: false,
      custom() {
        let set = 0;
        if (this.field("white.id").isSet) set += 4;
        if (this.field("black.id").isSet) set += 2;
        if (this.field("legacy_game_number").isSet) set += 1;
        if (set === 5 || set === 3 || set === 6 || set === 7) return;
        return [{ name: "white.id", type: SimpleSchema.ErrorTypes.REQUIRED }];
      }
    },
    rating: SimpleSchema.Integer
  }),
  black: new SimpleSchema({
    name: String,
    id: {
      type: String,
      required: false,
      custom() {
        let set = 0;
        if (this.field("white.id").isSet) set += 4;
        if (this.field("black.id").isSet) set += 2;
        if (this.field("legacy_game_number").isSet) set += 1;
        if (set === 5 || set === 3 || set === 6 || set === 7) return;
        return [{ name: "black.id", type: SimpleSchema.ErrorTypes.REQUIRED }];
      }
    },
    rating: SimpleSchema.Integer
  }),
  tags: { type: Object, required: false },
  actions: [actionSchema],
  observers: { type: Array, defaultValue: [] },
  "observers.$": String,
  variations: Object,
  "variations.hmtb": Number,
  "variations.cmi": Number,
  "variations.movelist": Array,
  "variations.movelist.$": Object,
  "variations.movelist.$.prev": { type: Number, required: false },
  "variations.movelist.$.move": { type: String, required: false },
  "variations.movelist.$.score": { type: Number, required: false },
  "variations.movelist.$.variations": { type: Array, required: false },
  "variations.movelist.$.variations.$": Number
});
