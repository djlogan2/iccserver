import { i18nCollection } from "../../collections/i18n";
import { Meteor } from "meteor/meteor";

//["messageid", "en_us", "es", "ru"]
const messages = [
  ["MATCH_DECLINED", "MATCH DECLINED {0}", "El mensaje con el valor {0} como valor de parámetro", "МАТЧ ОТКЛОНЕН {0}"],
  ["GAME_STATUS_w0", "Black resigns", "X", "X"],
  ["GAME_STATUS_w1", "Black checkmated", "X", "X"],
  ["GAME_STATUS_w2", "Black forfeits on time.", "X", "X"],
  ["GAME_STATUS_w3", "White declared the winner by adjudication", "X", "X"],
  ["GAME_STATUS_w4", "Black disconnected and forfeits", "X", "X"],
  ["GAME_STATUS_w13", "Game drawn by mutual agreement", "X", "X"],
  ["GAME_STATUS_w14", "Black stalemated", "X", "X"],
  ["GAME_STATUS_w15", "Game drawn by repetition", "X", "X"],
  ["GAME_STATUS_w16", "Game drawn by the 50 move rule", "X", "X"],
  ["GAME_STATUS_w17", "Black ran out of time and White has no material to mate", "X", "X"],
  ["GAME_STATUS_w18", "Game drawn because neither player has mating material", "X", "X"],
  ["GAME_STATUS_w24", "Game adjourned by mutual agreement", "X", "X"],
  ["GAME_STATUS_w30", "Game aborted by mutual agreement", "X", "X"],
  ["GAME_STATUS_w37", "Game aborted by Black at move 1", "X", "X"],
  ["GAME_STATUS_b0", "White resigns", "X", "X"],
  ["GAME_STATUS_b1", "White checkmated", "X", "X"],
  ["GAME_STATUS_b2", "White forfeits on time.", "X", "X"],
  ["GAME_STATUS_b3", "Black declared the winner by adjudication", "X", "X"],
  ["GAME_STATUS_b4", "White disconnected and forfeits", "X", "X"],
  ["GAME_STATUS_b13", "Game drawn by mutual agreement", "X", "X"],
  ["GAME_STATUS_b14", "White stalemated", "X", "X"],
  ["GAME_STATUS_b15", "Game drawn by repetition", "X", "X"],
  ["GAME_STATUS_b16", "Game drawn by the 50 move rule", "X", "X"],
  ["GAME_STATUS_b17", "Black ran out of time and White has no material to mate", "X", "X"],
  ["GAME_STATUS_b18", "Game drawn because neither player has mating material", "X", "X"],
  ["GAME_STATUS_b24", "Game adjourned by mutual agreement", "X", "X"],
  ["GAME_STATUS_b30", "Game aborted by mutual agreement", "X", "X"],
  ["GAME_STATUS_b37", "Game aborted by {0} at move 1", "X", "X"],
  ["CANNOT_MATCH_LOGGED_OFF_USER", "CANNOT MATCH LOGGED OFF USER {0}", "El mensaje con el valor {0} como valor de parámetro", "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ {0}"],
  ["NO_MATCH_FOUND", "NO MATCH FOUND {0}", "El mensaje con el valor {0} como valor de parámetro", "НЕ НАЙДЕНО {0}"],
  ["TAKEBACK_ACCEPTED", "TAKEBACK ACCEPTED {0}", "El mensaje con el valor {0} como valor de parámetro", "ПРИНЯТЬ ОБРАТНО ПРИНЯТО {0}"],
  ["NOT_PLAYING_A_GAME", "NOT PLAYING A GAME {0}", "El mensaje con el valor {0} como valor de parámetro", "НЕ ИГРАТЬ В ИГРУ {0}"],
  ["NO_TAKEBACK_PENDING", "NO TAKEBACK PENDING {0}", "El mensaje con el valor {0} como valor de parámetro", "НЕТ ВЕРНУТЬ В ОЖИДАНИИ {0}"],
  ["TAKEBACK_DECLINED", "TAKEBACK DECLINED {0}", "El mensaje con el valor {0} como valor de parámetro", "НЕ НАЙДЕНО {0}"],
  ["DRAW_ALREADY_PENDING", "DRAW ALREADY PENDING {0}", "El mensaje con el valor {0} como valor de parámetro", "ВЕРНУТЬСЯ ОТКЛОНЕНО {0}"],
  ["ABORT_ALREADY_PENDING", "ABORT ALREADY PENDING {0}", "El mensaje con el valor {0} como valor de parámetro", "АБОРТ УЖЕ В ОЖИДАНИИ {0}"],
  ["ADJOURN_ALREADY_PENDING", "ADJOURN ALREADY PENDING {0}", "El mensaje con el valor {0} como valor de parámetro", "ADJOURN УЖЕ В ОЖИДАНИИ {0}"],
  ["DRAW_DECLINED", "DRAW DECLINED {0}", "El mensaje con el valor {0} como valor de parámetro", "РИСУНОК ОТКЛОНЕН {0}"],
  ["ABORT_DECLINED", "ABORT DECLINED {0}", "El mensaje con el valor {0} como valor de parámetro", "АБОРТ ОТКЛОНЕН {0}"],
  ["ADJOURN_DECLINED", "ADJOURN DECLINED {0}", "El mensaje con el valor {0} como valor de parámetro", "ADJOURN ОТКЛОНЕН {0}"],
  ["NOT_AN_EXAMINER", "NOT AN EXAMINER {0}", "El mensaje con el valor {0} como valor de parámetro", "НЕ ЭКСПЕРТ {0}"],
  ["END_OF_GAME", "END OF GAME {0}", "El mensaje con el valor {0} como valor de parámetro", "конец игры {0}"],
  ["INVALID_VARIATION", "INVALID VARIATION {0}", "El mensaje con el valor {0} como valor de parámetro", "недопустимый вариант изменения {0}"],
  ["VARIATION_REQUIRED", "VARIATION REQUIRED {0}", "El mensaje con el valor {0} como valor de parámetro", "ВАРИАЦИЯ ТРЕБУЕТСЯ {0}"],
  ["UNABLE_TO_PLAY_OPPONENT", "UNABLE TO PLAY OPPONENT {0}", "El mensaje con el valor {0} como valor de parámetro", "Невозможно играть противником {0}"],
  ["SERVER_ERROR", "SERVER_ERROR. message={0} reason={1}", "SERVER_ERROR", "SERVER_ERROR"]
];

export default function firstAddI18nMessage() {
  if (!Meteor.isTest && !Meteor.isAppTest && i18nCollection.find().count() === 0) {
    //  i18nCollection.rawCollection().createIndex({ messageid: 1, locale: 1 }, { unique: true });
    messages.forEach(i18nMessage => {
      const locales = ["x", "en_us", "es", "ru"];
      ////["messageid", "en_us", "es", "ru"]
      for (let x = 1; x < locales.length; x++) {
        const record = {
          messageid: i18nMessage[0],
          locale: locales[x],
          text: i18nMessage[x]
        };
        i18nCollection.insert(record);
      }
    });
  }
}
