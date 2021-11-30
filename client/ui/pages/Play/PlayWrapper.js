import React, { useState } from "react";
import Play from "./Play";
import { withSounds } from "../../HOCs/withSounds";

const PlayWrapper = ({playSound, ...props}) => {
  const [turn, setTurn] = useState(0);
  const [game, setGame] = useState({
    type: null,
    data: null,
  })
  const setGameTurn = (val, isMy) => {
    if (turn !== val) {
      setTurn(val);
      if (isMy) {
        playSound("my_turn");
      } else {
        playSound("opponent_turn");
      }
    }
  }

  return (
    <Play {...props} setGameTurn={setGameTurn} setGame={setGame} game={game}/>
  )
}
export default withSounds("GameTurns")(PlayWrapper);