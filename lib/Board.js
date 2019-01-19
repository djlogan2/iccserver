const startingBoardPosition = [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    [null,  null, null, null, null, null, null, null],
    [null,  null, null, null, null, null, null, null],
    [null,  null, null, null, null, null, null, null],
    [null,  null, null, null, null, null, null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
];

const debug_moves = [];

const Board = {
    /**
     *
     * @parm {String} top - 'white' or 'black'
     * @param {array} board - Array of String pieces, such as 'black-king'
     * @param {String} smith - A long smith move [from-square to-square capture-indicator promoted-to]
     * @return {Array} board - Returns the updated board
     */
    updateBoardWithSmithMove: function(top, board, smith) {
        console.log('top=' + top + ', smith=' + smith);
        debug_moves.push({top: top, board: board, smith: smith});

        let rank_file_from = this.boardIndexes(top, smith.substr(0, 2));
        let rank_file_to = this.boardIndexes(top, smith.substr(2, 2));

        console.log('rank_file_from=' + JSON.stringify(rank_file_from) + ', rank_file_to=' + JSON.stringify(rank_file_to));

        let targetPiece = board[rank_file_from[0]][rank_file_from[1]].split('-');
        console.log('targetPiece=' + JSON.stringify(targetPiece));

        let enpassant = false;

        if(smith.length === 5)
            switch (smith.charAt(4)) {
                case 'N':
                case 'n':
                    targetPiece[1] = 'knight';
                    break;
                case 'B':
                case 'b':
                    targetPiece[1] = 'bishop';
                    break;
                case 'R':
                case 'r':
                    targetPiece[1] = 'rook';
                    break;
                case 'Q':
                case 'q':
                    targetPiece[1] = 'queen';
                    break;
                case 'E':
                    enpassant = true;
                case 'p':
                    targetPiece[1] = 'pawn';
                    break;
                case 'k':
                    targetPiece[1] = 'king';
                    break;
                default:
                    break;
        }

        console.log('targetPiece=' + JSON.stringify(targetPiece) + ', enpassant=' + enpassant);

        if(!board[rank_file_from[0]][rank_file_from[1]])
            alert('Problem #1');
        if(!targetPiece[0] || !targetPiece[1])
            alert('Problem #2');
        if(enpassant && !board[rank_file_to[0]][rank_file_from[1]])
            alert('Problem #3');

        board[rank_file_from[0]][rank_file_from[1]] = null;
        board[rank_file_to[0]][rank_file_to[1]] = targetPiece[0] + '-' + targetPiece[1];
        if (enpassant)
            board[rank_file_to[0]][rank_file_from[1]] = null;

        let rook_from = null;
        let rook_to = null;

        switch(smith) {
            case 'e1g1c':
                rook_from = this.boardIndexes(top, 'h1');
                rook_to = this.boardIndexes(top, 'f1');
                break;
            case 'e1c1c':
                rook_from = this.boardIndexes(top, 'a1');
                rook_to = this.boardIndexes(top, 'd1');
                break;
            case 'e8g8c':
                rook_from = this.boardIndexes(top, 'h8');
                rook_to = this.boardIndexes(top, 'f8');
                break;
            case 'e8c8c':
                rook_from = this.boardIndexes(top, 'a8');
                rook_to = this.boardIndexes(top, 'd8');
                break;
            default:
                break;
        }

        if(rook_from && rook_to) {
            if(board[rook_to[0]][rook_to[1]])
                alert('Problem #4');
            if(!board[rook_from[0]][rook_from[1]])
                alert('Problem #5');
            board[rook_to[0]][rook_to[1]] = board[rook_from[0]][rook_from[1]];
            board[rook_from[0]][rook_from[1]] = null;
        }

        return board;
    },

    /**
     *
     * @param {String} top - 'white' or 'black'
     * @param {String} fen A valid FEN string
     * @return {Array} Returns a board array
     */
    setBoardPositionFromFen: function(top, fen) {
        //TODO: this
        return board;
    },

    /**
     *
     * @param {String} top - 'white' or 'black'
     * @param {String} square - The algebraic square (i.e. 'e4')
     * @return {number[]} - The [rank, file] index
     */
    boardIndexes: function (top, square) {
        let file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        let rank = square.charCodeAt(1) - '1'.charCodeAt(0);

        if (top === 'black') {
            rank = 7 - rank;
        } else {
            file = 7 - file;
        }

        console.log('boardIndex, top=' + top + ', square=' + square + ', rank=' + rank + ', file=' + file);
        return [rank, file];
    },

    /**
     *
     * @param top - 'white' or 'black'
     * @return {Array} - The board
     */
    startingPosition: function(top) {
        let board = [];

        startingBoardPosition.forEach(row => {
            let board_row = [];
            row.forEach(square => {
                board_row.push(square)
            });
            if(top === 'white')
                board_row.reverse();
            board.push(board_row);
        });

        if(top === 'white')
            board.reverse();

        return board;
    },

    /**
     *
     * @param {Array} board
     * @return {Array} board - The flipped board
     */
    flip: function(board) {
        board.map(row => row.reverse());
        board.reverse();
        return board;
    }
};

export {Board};