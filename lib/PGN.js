import date from "date-and-time";

//
// movelist: {
//    move: e4,
//    comment: "whatever comments",
//
// }
// The first seven tags:
// Event (the name of the tournament or match event)
// Site (the location of the event)
// Date (the starting date of the game)
// Round (the playing round ordinal of the game)
// White (the player of the white pieces)
// Black (the player of the black pieces)
// Result (the result of the game)
// The remainder are written in sorted ASCII order
const PGN = function(game) {
  if (game) {
  } else {
  }

  function createFromGameObject(game) {
      if(!!game.tags)
          this.tags = game.tags;
      if(!tags.Date) {
          if(!!game.startTime) {
              tags.Date = date.format(game.startTime = Date.format()
          } else {
              tags.Date = "?";
          }
      }

      if(!tags.Event)
          tags.Event = "Exported by ICC";
      if(!tags.Site)
          tags.Site = "Internet Chessclub (https://chessclub.com)";
      if(!tags.Round)
          tags.Round = 1;
      if(!tags.White) {
          if(game.white && game.white.name)
              tags.White = game.white.name;
          else
              tags.White = "?";
      }
      if(!tags.Black) {
          if(game.black && game.black.name)
              tags.Black = game.black.name;
          else
              tags.Black = "?";
      }
      if(!tags.Result) {
          if(game.result)
              tags.Result = game.result;
          else
              tags.Result = "?";
      }
      if(!tags.WhiteElo && game.white && game.white.rating)
          tags.WhiteElo = game.white.rating;
      if(!tags.BlackElo && game.black && game.black.rating)
          tags.BlackElo = game.black.rating;
      if(!tags.Time) {
          if(!!game.startTime)
              tags.Time = date.format(game.startTime, "hh:mm:ss");
          else
              tags.Time = "?";
      }
      if(!tags.TimeControl) {
          if(!game.clocks)
              tags.TimeControl = "?";
          else {
              switch (game.clocks.white.inc_or_delay_type) {
                  case "none":
                      tags.TimeControl = game.clocks.white.initial / 1000;
                      break;
                  case "us":
                  case "bronstein":
                  case "inc":
                      tags.TimeControl = game.clocks.white.initial / 1000 + "+" + game.clocks.white.inc_or_delay;
                      break;
                  default:
                      tags.TimeControl = "?";
                      break;
              }
          }
      }
  }

  function returnGameObject() {
  }

  function parsePGNString(str) {}

  function parsePGNStream(stream, completedGameFunction) {}

  return {
    gameObject: returnGameObject,
    parse: parsePGNString,
    parseStream: parsePGNStream
  };
};

exports.PGN = PGN;
