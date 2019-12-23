/*Constructor: Chess([ fen ])
.ascii()
.board()
.clear()
.fen()
.game_over()
.get(square)
.history([ options ])
.in_check()
.in_checkmate()
.in_draw()
.in_stalemate()
.in_threefold_repetition()
.header()
.insufficient_material()
.load_pgn(pgn, [ options ])
.moves([ options ])
    .pgn([ options ])

Returns the game in PGN format. Options is an optional parameter which may include max width and/or a newline character settings.

    var chess = new Chess();
chess.header('White', 'Plunky', 'Black', 'Plinkie');
chess.move('e4');
chess.move('e5');
chess.move('Nc3');
chess.move('Nc6');

chess.pgn({ max_width: 5, newline_char: '<br />' });
// -> '[White "Plunky"]<br />[Black "Plinkie"]<br /><br />1. e4 e5<br />2. Nc3 Nc6'
.put(piece, square)

Place a piece on the square where piece is an object with the form { type: ..., color: ... }. Returns true if the piece was successfully placed, otherwise, the board remains unchanged and false is returned. put() will fail when passed an invalid piece or square, or when two or more kings of the same color are placed.

chess.clear();

chess.put({ type: chess.PAWN, color: chess.BLACK }, 'a5') // put a black pawn on a5
// -> true
chess.put({ type: 'k', color: 'w' }, 'h1') // shorthand
// -> true

chess.fen();
// -> '8/8/8/p7/8/8/8/7K w - - 0 0'

chess.put({ type: 'z', color: 'w' }, 'a1') // invalid piece
// -> false

chess.clear();

chess.put({ type: 'k', color: 'w' }, 'a1')
// -> true

chess.put({ type: 'k', color: 'w' }, 'h1') // fail - two kings
    // -> false
    .remove(square)

Remove and return the piece on square.

chess.clear();
chess.put({ type: chess.PAWN, color: chess.BLACK }, 'a5') // put a black pawn on a5
chess.put({ type: chess.KING, color: chess.WHITE }, 'h1') // put a white king on h1

chess.remove('a5');
// -> { type: 'p', color: 'b' },
chess.remove('h1');
// -> { type: 'k', color: 'w' },
chess.remove('e1');
// -> null
.reset()

Reset the board to the initial starting position.

    .square_color(square)

Returns the color of the square ('light' or 'dark').

var chess = Chess();
chess.square_color('h1')
// -> 'light'
chess.square_color('a7')
// -> 'dark'
chess.square_color('bogus square')
    // -> null
    .turn()

Returns the current side to move.

chess.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
chess.turn()
    // -> 'b'
    .undo()

Takeback the last half-move, returning a move object if successful, otherwise null.

    var chess = new Chess();

chess.fen();
// -> 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
chess.move('e4');
chess.fen();
// -> 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'

chess.undo();
// -> { color: 'w', from: 'e2', to: 'e4', flags: 'b', piece: 'p', san: 'e4' }
chess.fen();
// -> 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
chess.undo();
// -> null
.validate_fen(fen):
*/
