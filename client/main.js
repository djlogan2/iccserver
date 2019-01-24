import {Template} from 'meteor/templating';
import {RealTime} from "../lib/client/RealTime";
import {Chess} from "chess.js";
import {Logger, SetupLogger} from '../lib/client/Logger';

import './main.html';
import './views/mainmenu.html';
import './views/mainmenu';
import './views/login.html';
import './views/login';

let log = new Logger('client/main_js');
const MILLISECONDS_BETWEEN_CLOCK_UPDATES = 50;

let chess = new Chess();
let top = 'black';
let bottom = 'white';
let rm_index = -1;

//
// Our subscriptions
//
Meteor.subscribe('userData');

//
// For the blaze templates
//
let gameInfo = new ReactiveDict();
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

//
// For the templates, but we have to provide
// the move objects
//
let movelistChanged = new Tracker.Dependency;

//
// For the game time updates
//
let intervalId = null;
let whitemillis = 0;
let blackmillis = 0;

//
// For sending crashes back to the disk log
// on the server
//
const _GlobalErrorHandler = window.onerror;

window.onerror = (msg, url, line) => {
    log.error(msg, {file: url, onLine: line});
    if (_GlobalErrorHandler) {
        _GlobalErrorHandler.apply(this, arguments);
    }
};

//
// Update the right colors clocks
//
function updateTime(not_to_move) {

    let themillis = ((chess.turn() === 'w') === !not_to_move ? whitemillis : blackmillis);

    let millis = themillis % 1000;

    let seconds = parseInt((themillis - millis)/1000);

    let minutes = parseInt(seconds / 60);
    seconds -= (minutes * 60);

    let hours = parseInt(minutes / 60);
    minutes -= (hours * 60);

    let timestring = '';
    if(hours) timestring = hours + ':';
    if(hours || minutes) {
        if(minutes < 10) timestring += '0';
        timestring += minutes + ':';
    } else
        timestring += '0:';

    if(seconds < 10)
        timestring += '0';
    timestring += seconds;

    if(seconds < 15 && !minutes && !hours)
        timestring += '.' + millis.toString().substr(0, 1);

    log.debug('updateTime',
        {
            rec_millis: themillis,
            whitemillis: whitemillis,
            blackmillis: blackmillis,
            millis: millis,
            seconds: seconds,
            minutes: minutes,
            hours: hours,
            timestring: timestring,
            turn: chess.turn(),
            top: top,
            not_to_move: not_to_move,
            sigh1: (chess.turn() === 'w' && !not_to_move ? 'white_time' : 'black_time'),
            sigh2: top.startsWith(chess.turn()) !== !!not_to_move ? 'top_time' : 'bottom_time'
        });


    gameInfo.set(chess.turn() === 'w' && !not_to_move ? 'white_time' : 'black_time', timestring);
    gameInfo.set(top.startsWith(chess.turn()) !== !!not_to_move ? 'top_time' : 'bottom_time', timestring);
}

//
// Scroll the move list to the last move
//
let scrollMoveListWaiting = false;
function scrollMoveListToBottom(){
    scrollMoveListWaiting = false;

    let last_box = $('.single-move').last();
    if(!last_box.length) return;

    let scroller = $('#moves-box');
    let lbot = last_box.offset().top;
    let lboh = last_box.outerHeight(true);
    let sot = scroller.offset().top;
    let soh = scroller.height();
    let scrolled = scroller.scrollTop();
    let amount = lbot + scrolled - sot - soh + lboh;

    log.debug('afterFlush', {
        html: last_box.html(),
        lbot: lbot,
        lboh: lboh,
        sot: sot,
        soh: soh,
        scrolled: scrolled,
        amount: amount
    });

    if(amount <= 0) return;

    scroller.scrollTop(amount);
}

//
// Get the "color-piece" class from the piece returned from chess.js
//
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

//
// Go through all 64 squares, looking for any class ("color-piece") that doesn't match
// the board returned from chess.js. Any mismatches, we remove the old class,
// and if there is a new one (i.e. a new piece), we set that one.
//
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

//
// This resizes the various div elements whenever the user adjusts the window
//
function onResize(){

    let movesAreaHeight  = $("#profile").outerHeight() + $("#clocks").outerHeight() + $("#bottom-controls").outerHeight();
    let h2 = $( window ).height() - movesAreaHeight;
    let cba = $('#chess-board-area');

    $("#moves-box").css( "height", h2 + "px" );
//    $("#moves-box").height(h2);

    var barsOffset  = $("#top_player_info_bar").outerHeight() + $("#bottom_player_info_bar").outerHeight();
    //var h = parseInt($( window ).height()-barsOffset / 8) * 8;

    var h = parseInt(cba.width() / 8) * 8;
    cba.css( "max-width", h + "px" );

    var sq = $('.square');
    var squareHeight = sq.width(); //SQUARES RESIZE Controls
    sq.height(squareHeight);
    $('.piece').height(squareHeight);//CHESS piece Controls
}

//
// This is called ever ms to update the current players time and
// adjust it on the screen.
//
function updatePlayerTime() {
    if(chess.turn() === 'w')
        whitemillis -= MILLISECONDS_BETWEEN_CLOCK_UPDATES;
    else
        blackmillis -= MILLISECONDS_BETWEEN_CLOCK_UPDATES;
    updateTime();
}

function updateMoversClock() {
    if(chess.turn() === 'w') {
        $('.white-countdown-board').addClass('error');
        $('.black-countdown-board').removeClass('error');
    } else {
        $('.white-countdown-board').removeClass('error');
        $('.black-countdown-board').addClass('error');
    }
    if(top.startsWith(chess.turn())) {
        $('.top-countdown-board').addClass('error');
        $('.bottom-countdown-board').removeClass('error');
    } else {
        $('.top-countdown-board').removeClass('error');
        $('.bottom-countdown-board').addClass('error');
    }
}

//
// This is the function called when the server calls us with a game start.
// Set everything up.
//
function game_start(rec) {
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
//    gameInfo.set('top_time', (rec.message[top].time % 60) + ':' + (rec.message[top].time / 60));
//    gameInfo.set('bottom_time', (rec.message[bottom].time % 60) + ':' + (rec.message[bottom].time / 60));
    gameInfo.set('white_name', rec.message.white.name);
    gameInfo.set('black_name', rec.message.black.name);
    gameInfo.set('white_rating', rec.message.white.rating);
    gameInfo.set('black_rating', rec.message.black.rating);
//    gameInfo.set('white_time', (rec.message.white.time % 60) + ':' + (rec.message.white.time / 60));
//    gameInfo.set('black_time', (rec.message.black.time % 60) + ':' + (rec.message.black.time / 60));
    //whitemillis = rec.message.white.time * 60 * 1000;
    //blackmillis = rec.message.black.time * 60 * 1000;
    updateBoard();
    //updateTime(false);
    //updateTime(true);
    updateMoversClock();
    movelistChanged.changed();

    if(!scrollMoveListWaiting) {
        Tracker.afterFlush(scrollMoveListToBottom);
        scrollMoveListWaiting = true;
    }

    //if(intervalId)
    //    clearInterval(intervalId);
    //intervalId = setInterval(updatePlayerTime, MILLISECONDS_BETWEEN_CLOCK_UPDATES);
}

//
// This is the function called whenever the server sends us a move.
// We can get a whole bunch of these at once
//
function game_move(rec) {
    log.debug('game_move', rec);

    if(!chess.move(rec.message.algebraic))
        log.error('Unable to make illegal move', rec);

    updateBoard();
    updateMoversClock();

    movelistChanged.changed();

    if(!scrollMoveListWaiting) {
        Tracker.afterFlush(scrollMoveListToBottom);
        scrollMoveListWaiting = true;
    }
}

function update_game_clock(rec) {
    log.debug('update_game_clock', rec);

    if(rec.message.color === 'w') {
        whitemillis = rec.message.millis;
    } else {
        blackmillis = rec.message.millis;
    }

    log.debug('update_game_clock', {
        whitemillis: whitemillis,
        blackmillis: blackmillis,
        intervalId: intervalId,
        chess_turn: chess.turn()
    });

    if(rec.message.startclock && !intervalId)
        intervalId = setInterval(updatePlayerTime, MILLISECONDS_BETWEEN_CLOCK_UPDATES);

    updateTime(rec.message.color !== chess.turn());
}
//
// Our reactive autorun. At this point, it's sole purpose is to retrieve the realtime records being sent
// from the server, which facilitates game play, time synchronization (lag measurement), that sort of thing.
//
// In the future, we could use realtime messages for more, but in general, I want to restrict it primarily to
// game play and lag measurements...things that REQUIRE the most accurate timing, and don't really fit the
// "write to mongo, server notices, sends updates to clients" model (like, say, messages.)
//
Tracker.autorun(function(){
    var records = RealTime.collection.find({nid: {$gt: rm_index}}, {sort: {"nid": 1}}).fetch();
    log.debug('Fetched ' + records.length + ' records from realtime_messages', {records: records});
    if(records.length)
        rm_index = records[records.length - 1].nid;
    records.forEach(rec => {
        log.debug('realtime_record', rec);
        rm_index = rec.nid;
        switch(rec.type) {
            case 'setup_logger':
                SetupLogger.addLoggers(rec.message);
                break;

            case 'game_start':
                game_start(rec);
                break;

            case 'game_move':
                game_move(rec);
                break;

            case 'update_game_clock':
                update_game_clock(rec);
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

Template.chessboard.helpers({
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
    row_col() { // Hard coded so that blaze can build the chessboard. STUPID, I know, but evidently necessary.
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
                    box: (2 - (moveno % 2)),
                    move: moveno,
                    white: move
                }
            }
        });
        if(moveobj) movelist.push(moveobj);
        return movelist;
    }
});
