const http = require("http");

// eslint-disable-next-line no-unused-vars
async function tablebase(game) {
  return new Promise((resolve, reject) => {
    const board = game.board();
    let piececount = 0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (!!board[x][y]) piececount++;
        if (piececount > 7) {
          resolve();
          return;
        }
      }
    }

    http
      .get("http://tablebase.lichess.ovh/standard?fen=" + game.fen().replace(/ /g, "_"), res => {
        let tb_response = "";
        res.setEncoding("utf-8");
        res.on("data", data => (tb_response += data));
        res.on("end", () => {
          const tbr = JSON.parse(tb_response);
          resolve(tbr);
        });
      })
      .on("error", err => {
        reject(err);
      });
  });
}
