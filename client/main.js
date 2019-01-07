import { Template } from 'meteor/templating';

import './main.html';

import './views/mainmenu.html';
import './views/mainmenu';

import './views/login.html';
import './views/login';

const startingBoardPosition = [
    ['black-rook', 'black-knight', 'black-bishop', 'black-king', 'black-queen', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    [null,  null, null, null, null, null, null, null],
    [null,  null, null, null, null, null, null, null],
    [null,  null, null, null, null, null, null, null],
    [null,  null, null, null, null, null, null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-king', 'white-queen', 'white-bishop', 'white-knight', 'white-rook']
];

function copyStartingBoardPosition() {
    let board = [];
    startingBoardPosition.forEach(row => {
        let board_row = [];
        row.forEach(square => {board_row.push(square)});
        board.push(board_row);
    });
    return board;
}

function setBoardPositionFromFen(fen) {

}

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
gameInfo.set('board', startingBoardPosition);
gameInfo.set('move_list', []);

function onResize(){
    var barsOffset  = $("#top_player_info_bar").outerHeight() + $("#bottom_player_info_bar").outerHeight();
    var h = $( window ).height()-barsOffset;
    $("#chess-board-area").css( "max-width", h );
    var movesAreaHeight  = $("#profile").outerHeight() + $("#clocks").outerHeight() + $("#bottom-controls").outerHeight();
    var h2 = $( window ).height() - movesAreaHeight;
    $("#moves-box").css( "height", h2 );
    var sq = $('.square');
    var squareHeight = sq.width(); //SQUARES RESIZE Controls
    sq.height(squareHeight);
    $('.piece').height(squareHeight);//CHESS piece Controls
}

Meteor.subscribe('userData');
Meteor.subscribe('realtime_messages');

let realtime_messages = new Mongo.Collection('realtime_messages');
let rm_index = -1;

Tracker.autorun(function(){
    //var records = realtime_messages.find().fetch();
    var records = realtime_messages.find({nid: {$gt: rm_index}}, {sort: {"nid": 1}}).fetch();
    console.log('Fetched ' + records.length + ' records from realtime_messages');
    records.forEach(rec => {
        console.log('realtime_message record: ' + JSON.stringify(rec));
        rm_index = rec.nid;
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
    Board() {
        return gameInfo.get('board');
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
        return gameInfo.get('move_list');
        /*
        return [
            {box: 2, move: 1, white: 'e4', black: 'e5'},
            {box: 1, move: 2, white: 'Bd3', black: 'Nd6'},
            {box: 2, move: 3, white: 'Qf3', black: 'e6'},
        ]
        */
    }
});