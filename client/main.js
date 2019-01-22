import {Template} from 'meteor/templating';
import {RealTime} from "../lib/client/RealTime";
import {Chess} from "chess.js";
import {Logger, SetupLogger} from '../lib/client/Logger';

import './main.html';

import './views/mainmenu.html';
import './views/mainmenu';

import './views/login.html';
import './views/login';

let gameInfo = new ReactiveDict();
let chess = new Chess();
let top = 'black';
let bottom = 'white';
let log = new Logger('client/main_js');

gameInfo.set('top_name', 'No game');
gameInfo.set('bottom_name', 'No game');
gameInfo.set('top_rating', 0);
gameInfo.set('bottom_rating', 0);
gameInfo.set('top_time', '0:00');
gameInfo.set('bottom_time', '0:00');
gameInfo.set('white_name', 'No game');
gameInfo.set('black_name', 'No game');
gameInfo.set('white_rating', 0);
gameInfo.set('black_rating', 0);
gameInfo.set('white_time', '0:00');
gameInfo.set('black_time', '0:00');

let movelistChanged = new Tracker.Dependency;

//gameInfo.set('board', Board.startingPosition(top));

//gameInfo.set('move_list', []);

const _GlobalErrorHandler = window.onerror;

window.onerror = (msg, url, line) => {
    log.error(msg, {file: url, onLine: line});
    if (_GlobalErrorHandler) {
        _GlobalErrorHandler.apply(this, arguments);
    }
};

function classFromBoard(board) {
    if(!board) return null;
    let piece = (board.color === 'w' ? 'white-' : 'black-');
    switch(board.type) {
        case 'r': piece += 'rook'; break;
        case 'n': piece += 'knight'; break;
        case 'b': piece += 'bishop'; break;
        case 'q': piece += 'queen'; break;
        case 'k': piece += 'king'; break;
        case 'p': piece += 'pawn'; break;
    }
    return piece;
}

function updateBoard() {
    let board = chess.board();
    for(var row = 0 ; row < 8 ; row++) {
        for(var col = 0 ; col < 8 ; col++) {

            let sq = $('[row=' + row + '][col=' + col + '] .piece');
            let current_piece = sq.attr('class').split(/\s+/).filter((cl) => {return cl !== 'piece'});
            let new_piece = classFromBoard(board[row][col]);
            if(current_piece) current_piece = current_piece[0];

            if(current_piece !== new_piece) {
                if(current_piece) sq.removeClass(current_piece);
                if(new_piece) sq.addClass(new_piece);
            }
        }
    }
}

function onResize(){

    var movesAreaHeight  = $("#profile").outerHeight() + $("#clocks").outerHeight() + $("#bottom-controls").outerHeight();
    var h2 = $( window ).height() - movesAreaHeight;
    $("#moves-box").css( "height", h2 );

    var barsOffset  = $("#top_player_info_bar").outerHeight() + $("#bottom_player_info_bar").outerHeight();
    var h = parseInt($( window ).height()-barsOffset / 8) * 8;
    var h = parseInt($('#chess-board-area').width() / 8) * 8;

    $("#chess-board-area").css( "max-width", h );
    var sq = $('.square');
    var squareHeight = sq.width(); //SQUARES RESIZE Controls
    sq.height(squareHeight);
    $('.piece').height(squareHeight);//CHESS piece Controls
}

Meteor.subscribe('userData');

let rm_index = -1;

Tracker.autorun(function(){
    var records = RealTime.collection.find({nid: {$gt: rm_index}}, {sort: {"nid": 1}}).fetch();
    log.debug('Fetched ' + records.length + ' records from realtime_messages', {records: records});
    if(records.length)
        rm_index = records[records.length - 1].nid;
    records.forEach(rec => {
        if(Roles.userIsInRole(this.userId, 'developer'))
            log.debug('realtime_record', rec);
        rm_index = rec.nid;
        switch(rec.type) {
            case 'setup_logger':
                SetupLogger.addLoggers(rec.message);
                break;
            case 'game_start':
                //let top = 'black';
                //let bottom = 'white';
                chess.reset();
                chess.header(
                    'White', rec.message.white.name,
                    'Black', rec.message.black.name,
                    'Date', new Date(),
                    'White Rating', rec.message.white.rating,
                    'Black Rating', rec.message.black.rating
                );
                gameInfo.set('top_name', rec.message[top].name);
                gameInfo.set('bottom_name', rec.message[bottom].name);
                gameInfo.set('top_rating', rec.message[top].rating);
                gameInfo.set('bottom_rating', rec.message[bottom].rating);
                gameInfo.set('top_time', (rec.message[top].time % 60) + ':' + (rec.message[top].time / 60));
                gameInfo.set('bottom_time', (rec.message[bottom].time % 60) + ':' + (rec.message[bottom].time / 60));
                gameInfo.set('white_name', rec.message.white.name);
                gameInfo.set('black_name', rec.message.black.name);
                gameInfo.set('white_rating', rec.message.white.rating);
                gameInfo.set('black_rating', rec.message.black.rating);
                gameInfo.set('white_time', (rec.message.white.time % 60) + ':' + (rec.message.white.time / 60));
                gameInfo.set('black_time', (rec.message.black.time % 60) + ':' + (rec.message.black.time / 60));
                updateBoard();
                movelistChanged.changed();
                break;

            case 'game_move':
                log.debug('game_move', rec);

                if(chess.turn() === 'b') {
                    gameInfo.set('black_time', (rec.message.seconds % 60) + ':' + (rec.message.seconds / 60));
                    if(top === 'white')
                        gameInfo.set('bottom_time', gameInfo.get('black_time'));
                    else
                        gameInfo.set('top_time', gameInfo.get('black_time'));
                } else {
                    gameInfo.set('white_time', (rec.message.seconds % 60) + ':' + (rec.message.seconds / 60));
                    if(top === 'white')
                        gameInfo.set('top_time', gameInfo.get('white_time'));
                    else
                        gameInfo.set('bottom_time', gameInfo.get('white_time'));
                }
                if(!chess.move(rec.message.algebraic))
                    log.error('Unable to make illegal move', rec);

                updateBoard();
                movelistChanged.changed();

                break;

            case 'error':
            default:
                log.error('realtime_message default', rec);
        }
    });
});

Template.chessboard.onRendered(function() {
    $(window).resize(onResize);
    onResize();
});

const piecemap = {
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
    p: 'pawn'
};

Template.chessboard.helpers({
    boardWidth() {
        return chessboardSide.get();
    },
    boardHeight() {
        return chessboardSide.get();
    },
    squareWidth() {
        return (chessboardSide.get() / 8);
    },
    squareHeight() {
        return (chessboardSide.get() / 8);
    },
    squareColor(row, col) {
        if(row % 2 === 0) {
            if(col % 2 === 0) {
                return 'chess-field-light';
            } else {
                return 'chess-field-dark';
            }
        } else {
            if(col % 2 === 0) {
                return 'chess-field-dark';
            } else {
                return 'chess-field-light';
            }
        }
    },
    TopPlayer() {
        return {
            name: gameInfo.get('top_name'),
            rating: gameInfo.get('top_rating'),
            profile_image: 'image.gif',
            flag_image: 'images/flags/us.jpg'
        }
    },
    BottomPlayer() {
        return {
            name: gameInfo.get('bottom_name'),
            rating: gameInfo.get('bottom_rating'),
            profile_image: 'image.gif',
            flag_image: 'images/flags/us.jpg'
        }
    },
    TopTime() {
        return gameInfo.get('top_time');
    },
    BottomTime() {
        return gameInfo.get('bottom_time');
    },
    row_col() {
        return [0,1,2,3,4,5,6,7];
    }
});

//Template.chessboard.events({
    //'click button'(event, templateInstance) {
    // increment the counter when button is clicked
        //templateInstance.counter.set(templateInstance.counter.get() + 1);
    //},
//});

Template.rightmenu.helpers({
    WhitePlayer() {
        return {
            name: gameInfo.get('white_name'),
            rating: gameInfo.get('white_rating'),
            won: 12,
            draws: 23,
            lost: 34,
            flag_image: 'images/flags/us.jpg'
        }
    },
    BlackPlayer() {
        return {
            name: gameInfo.get('black_name'),
            rating: gameInfo.get('black_rating'),
            won: 23,
            draws: 34,
            lost: 45,
            flag_image: 'images/flags/us.jpg'
        }
    },
    WhiteTime() {
        return gameInfo.get('white_time');
    },
    BlackTime() {
        return gameInfo.get('black_time');
    },
    Opening() {
        return 'Opening goes here';
    },
    MoveList() {
        movelistChanged.depend();
        var moveobj = null;
        var moveno = 1;
        var movelist = [];
        chess.history().forEach(move => {
            if(moveobj) {
                moveobj.black = move;
                movelist.push(moveobj);
                moveobj = null;
                moveno++;
            } else {
                moveobj = {
                    box: moveno,
                    move: moveno,
                    white: move
                }
            }
        });
        if(moveobj) movelist.push(moveobj);
        return movelist;
    }
});