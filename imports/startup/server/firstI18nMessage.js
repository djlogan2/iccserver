import { i18nCollection } from "../../collections/i18n";
import { Meteor } from "meteor/meteor";

//["messageid", "en_us", "es", "ru"]
const messages = [
  [
    "ABORT_ALREADY_PENDING",
    "ABORT ALREADY PENDING {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "АБОРТ УЖЕ В ОЖИДАНИИ {0}"
  ],
  [
    "ABORT_DECLINED",
    "ABORT DECLINED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "АБОРТ ОТКЛОНЕН {0}"
  ],
  [
    "ADJOURN_ALREADY_PENDING",
    "ADJOURN ALREADY PENDING {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "ADJOURN УЖЕ В ОЖИДАНИИ {0}"
  ],
  [
    "ADJOURN_DECLINED",
    "ADJOURN DECLINED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "ADJOURN ОТКЛОНЕН {0}"
  ],
  ["ALREADY_AN_EXAMINER", "You are already an examiner"],
  ["ALREADY_PLAYING", "You are already playing a game"],
  ["BEGINNING_OF_GAME", "You are at the beginning of the game"],
  ["CANNOT_INVITE_YOURSELF", "You cannot invite yourself"],
  [
    "CANNOT_MATCH_LOGGED_OFF_USER",
    "CANNOT MATCH LOGGED OFF USER {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ {0}"
  ],
  ["CHILD_CHAT_EXEMPT_KIBITZ_NOT_ALLOWED", "Not allowed to kibitz"],
  ["CHILD_CHAT_FREEFORM_NOT_ALLOWED", "Not allowed to chat"],
  ["CHILD_CHAT_NOT_ALLOWED", "Not allowed to chat"],
  ["COMMAND_INVALID_NOT_YOUR_MOVE", "Not your move"],
  ["COMMAND_INVALID_ON_PUBLIC_GAME", "Invalid command for a public game"],
  ["COMMAND_INVALID_WITH_OWNED_GAME", "Invalid command for an owned game"],
  [
    "DRAW_ALREADY_PENDING",
    "DRAW ALREADY PENDING {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "ВЕРНУТЬСЯ ОТКЛОНЕНО {0}"
  ],
  [
    "DRAW_DECLINED",
    "DRAW DECLINED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "РИСУНОК ОТКЛОНЕН {0}"
  ],
  [
    "END_OF_GAME",
    "END OF GAME {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "конец игры {0}"
  ],
  ["END_OF_GAME", "End of game"],
  ["FOR_TESTING_10", "For testing"],
  ["GAME_STATUS_b0", "White resigns"],
  ["GAME_STATUS_b1", "White checkmated"],
  ["GAME_STATUS_b2", "White forfeits on time."],
  ["GAME_STATUS_b3", "Black declared the winner by adjudication"],
  ["GAME_STATUS_b4", "White disconnected and forfeits"],
  ["GAME_STATUS_b13", "Game drawn by mutual agreement"],
  ["GAME_STATUS_b14", "White stalemated"],
  ["GAME_STATUS_b15", "Game drawn by repetition"],
  ["GAME_STATUS_b16", "Game drawn by the 50 move rule"],
  ["GAME_STATUS_b17", "Black ran out of time and White has no material to mate"],
  ["GAME_STATUS_b18", "Game drawn because neither player has mating material"],
  ["GAME_STATUS_b24", "Game adjourned by mutual agreement"],
  ["GAME_STATUS_b30", "Game aborted by mutual agreement"],
  ["GAME_STATUS_b37", "Game aborted by {0} at move 1"],
  ["GAME_STATUS_w0", "Black resigns"],
  ["GAME_STATUS_w1", "Black checkmated"],
  ["GAME_STATUS_w2", "Black forfeits on time."],
  ["GAME_STATUS_w3", "White declared the winner by adjudication"],
  ["GAME_STATUS_w4", "Black disconnected and forfeits"],
  ["GAME_STATUS_w13", "Game drawn by mutual agreement"],
  ["GAME_STATUS_w14", "Black stalemated"],
  ["GAME_STATUS_w15", "Game drawn by repetition"],
  ["GAME_STATUS_w16", "Game drawn by the 50 move rule"],
  ["GAME_STATUS_w17", "Black ran out of time and White has no material to mate"],
  ["GAME_STATUS_w18", "Game drawn because neither player has mating material"],
  ["GAME_STATUS_w24", "Game adjourned by mutual agreement"],
  ["GAME_STATUS_w30", "Game aborted by mutual agreement"],
  ["GAME_STATUS_w37", "Game aborted by Black at move 1"],
  ["ILLEGAL_MOVE", "{0} is an illegal move"],
  ["INVALID_ARROW", "{0}-{1} are invalid arrow coordinates"],
  ["INVALID_GAME", "Invalid game or game does not exist"],
  ["INVALID_ROOM", "Invalid room or room does not exist"],
  ["INVALID_SQUARE", "{0} is an invalid square"],
  ["INVALID_USER", "Invalid user or user does not exist"],
  [
    "INVALID_VARIATION",
    "INVALID VARIATION {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "недопустимый вариант изменения {0}"
  ],
  ["LEGACY_MATCH_REMOVED", "Legacy match removed: {0}"],
  ["LOGIN_FAILED_1"],
  ["LOGIN_FAILED_2"],
  ["LOGIN_FAILED_3"],
  ["LOGIN_FAILED_4"],
  ["LOGIN_FAILED_5"],
  ["LOGIN_FAILED_6"],
  ["LOGIN_FAILED_7"],
  ["LOGIN_FAILED_8"],
  ["LOGIN_FAILED_9"],
  ["LOGIN_FAILED_10"],
  ["LOGIN_FAILED_11"],
  ["LOGIN_FAILED_12"],
  ["LOGIN_FAILED_13"],
  ["LOGIN_FAILED_14"],
  ["LOGIN_FAILED_15"],
  ["LOGIN_FAILED_16"],
  ["LOGIN_FAILED_17"],
  ["LOGIN_FAILED_18"],
  ["LOGIN_FAILED_19"],
  ["LOGIN_FAILED_20"],
  ["LOGIN_FAILED_21"],
  ["LOGIN_FAILED_22"],
  [
    "LOGIN_FAILED_DUP",
    "This user is already logged in",
    "Este usuario ya ha iniciado sesión",
    "Этот пользователь уже вошел в систему"
  ],
  [
    "MATCH_DECLINED",
    "MATCH DECLINED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "МАТЧ ОТКЛОНЕН {0}"
  ],
  [
    "NO_MATCH_FOUND",
    "NO MATCH FOUND {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "НЕ НАЙДЕНО {0}"
  ],
  [
    "NO_TAKEBACK_PENDING",
    "NO TAKEBACK PENDING {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "НЕТ ВЕРНУТЬ В ОЖИДАНИИ {0}"
  ],
  ["NOT_ALLOWED_TO_CHAT_IN_ROOM", "Not allowed to chat in rooms"],
  ["NOT_ALLOWED_TO_DELETE_ROOM", "Not allowed to delete room"],
  ["NOT_ALLOWED_TO_JOIN_ROOM", "Not allowed to join room"],
  ["NOT_ALLOWED_TO_KIBITZ", "Not allowed to kibitz"],
  [
    "NOT_AN_EXAMINER",
    "NOT AN EXAMINER {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "НЕ ЭКСПЕРТ {0}"
  ],
  ["NOT_AN_OBSERVER", "You are not an observer"],
  ["NOT_AUTHORIZED", "You are not authorized"],
  ["NOT_IN_ROOM", "You are not in room"],
  [
    "NOT_PLAYING_A_GAME",
    "NOT PLAYING A GAME {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "НЕ ИГРАТЬ В ИГРУ {0}"
  ],
  ["NOT_PLAYING_OR_EXAMINING", "You are not playing nor examining"],
  ["NOT_THE_OWNER", "You are not the owner"],
  ["PRIVATE_ENTRY_ACCEPTED", "You have been accepted into the room"],
  ["PRIVATE_ENTRY_DENIED", "You have not been accepted into the room"],
  ["PRIVATE_ENTRY_REMOVED", "User removed room invite"],
  ["PRIVATE_ENTRY_REQUESTED", "User requested to join a room"],
  ["PRIVATE_GAME", "Private game"],
  ["RECIPIENT_NOT_ALLOWED_TO_FREEFORM_CHAT", "Not allowed to chat with member"],
  ["RECIPIENT_NOT_ALLOWED_TO_PERSONAL_CHAT", "Not allowed to chat with member"],
  ["ROOM_ALREADY_EXISTS", "Room already exists"],
  ["ROOM_DOES_NOT_EXIST", "Room does not exist"],
  ["SENDER_NOT_ALLOWED_TO_PERSONAL_CHAT", "Not allowed to chat privately"],
  ["SERVER_ERROR", "SERVER_ERROR. message={0} reason={1}", "SERVER_ERROR", "SERVER_ERROR"],
  [
    "TAKEBACK_ACCEPTED",
    "TAKEBACK ACCEPTED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "ПРИНЯТЬ ОБРАТНО ПРИНЯТО {0}"
  ],
  ["TAKEBACK_ALREADY_PENDING", "A takeback is already pending"],
  [
    "TAKEBACK_DECLINED",
    "TAKEBACK DECLINED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "НЕ НАЙДЕНО {0}"
  ],
  ["TOO_MANY_PRIVATE_ROOMS", "You are at the limit of private rooms you can create"],
  ["UNABLE_TO_CHANGE_OWNER", "Unable to change the rooms owner"],
  [
    "UNABLE_TO_PLAY_OPPONENT",
    "UNABLE TO PLAY OPPONENT {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "Невозможно играть противником {0}"
  ],
  ["UNABLE_TO_PLAY_RATED_GAMES", "Unable to play a rated game"],
  ["UNABLE_TO_PLAY_UNRATED_GAMES", "Unable to play an unrated game"],
  ["UNABLE_TO_PRIVATIZE", "Unable to privatize game"],
  ["UNABLE_TO_RESTRICT_ANALYSIS", "Unable to restrict analysis"],
  ["UNABLE_TO_RESTRICT_CHAT", "Unable to restrict chat"],
  ["USER_DECLINED_INVITE", "User declined invite"],
  ["USER_LOGGED_OFF", "User logged off"],
  [
    "VARIATION_REQUIRED",
    "VARIATION REQUIRED {0}",
    "El mensaje con el valor {0} como valor de parámetro",
    "ВАРИАЦИЯ ТРЕБУЕТСЯ {0}"
  ]
];

export default function firstAddI18nMessage() {
  //
  if (!Meteor.isTest && !Meteor.isAppTest && i18nCollection.find().count() === 0) {
    messages.forEach(i18nMessage => {
      const locales = ["x", "en_us", "es", "ru"];
      ////["messageid", "en_us", "es", "ru"]
      for (let x = 1; x < Math.min(locales.length, i18nMessage.length); x++) {
        i18nCollection.insert({
          messageid: i18nMessage[0],
          locale: locales[x],
          text: i18nMessage[x]
        });
      }
    });
  }
}
