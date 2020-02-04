//
// For the UI. You can use this function via an import, or you are welcome to just copy
// this code wherever you need it and delete this file. It just returns the current
// value for the colors clock, in milliseconds, when you pass it the game record and
// which color you want the clock time for.
//
export default function(game_record, color) {
  if (color !== game_record.tomove) return game_record.clocks[color].current;

  const timediff = new Date().getTime() - game_record.clocks[color].starttime;

  if (
    game_record.clocks[color].delaytype === "us" &&
    (game_record.clocks[color].delay | 0) * 1000 <= timediff
  )
    return game_record.clocks[color].current;
  else return game_record.clocks[color].current - timediff;
}
