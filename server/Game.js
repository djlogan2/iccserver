import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const GameCollection = new Mongo.Collection('game');
const moveSchema = new SimpleSchema({
	algebraic: { type: String },
	smith: { type: String },
	time: { type: SimpleSchema.Integer }
});
const playerSchema = new SimpleSchema({
	name: { type: String },
	userid: { type: String, regEx: SimpleSchema.RegEx.Id },
	rating: { type: SimpleSchema.Integer }
});
const takebackSchema = new SimpleSchema({
	action: { type: String, allowedValues: ['takeback'] },
	number: { type: SimpleSchema.Integer },
	time: { type: SimpleSchema.Integer }
});
const drawOfferedSchema = new SimpleSchema({
	action: { type: String, allowedValues: ['draw'] },
	number: { type: SimpleSchema.Integer },
	time: { type: SimpleSchema.Integer }
});
const GameSchema = new SimpleSchema({
	startTime: {
		type: Date,
		autoValue: function() {
			return new Date();
		}
	},
	white: [playerSchema],
	black: [playerSchema],
	whiteTime: { type: SimpleSchema.Integer },
	blackTime: { type: SimpleSchema.Integer },
	startingFen: { type: String, optional: true }
});

const Game = {
	/**
   *
   * @param {string} whiteName
   * @param {int} whiteRating
   * @param {string} blackName
   * @param {int} blackRating
   * @param {int} whiteTime
   * @param {int} blackTime
   * @returns {string} gameId
   */
	start(whiteName, whiteRating, blackName, blackRating, whiteTime, blackTime) {
		return;
	},
	end() {}
};

export { Game };
