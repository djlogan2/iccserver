import { i18nCollection } from "./../../collections/i18n";
import { Meteor } from "meteor/meteor";

//["messageid", "en_us", "es", "ru"]
const messages = [
  [
    "MATCH_DECLINED",
    "MATCH DECLINED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "МАТЧ ОТКЛОНЕН {1}"
  ],
  [
    "CHECK_MATE",
    "CHECK MATE GAME OVER!{1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ ЭКСПЕРТ {1}"
  ],
  [
    "CANNOT_MATCH_LOGGED_OFF_USER",
    "CANNOT MATCH LOGGED OFF USER {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ {1}"
  ],
  [
    "NO_MATCH_FOUND",
    "NO MATCH FOUND {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ НАЙДЕНО {1}"
  ],
  [
    "TAKEBACK_ACCEPTED",
    "TAKEBACK ACCEPTED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "ПРИНЯТЬ ОБРАТНО ПРИНЯТО {1}"
  ],
  [
    "NOT_PLAYING_A_GAME",
    "NOT PLAYING A GAME {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ ИГРАТЬ В ИГРУ {1}"
  ],
  [
    "NO_TAKEBACK_PENDING",
    "NO TAKEBACK PENDING {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕТ ВЕРНУТЬ В ОЖИДАНИИ {1}"
  ],
  [
    "TAKEBACK_DECLINED",
    "TAKEBACK DECLINED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ НАЙДЕНО {1}"
  ],
  [
    "DRAW_ALREADY_PENDING",
    "DRAW ALREADY PENDING {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "ВЕРНУТЬСЯ ОТКЛОНЕНО {1}"
  ],
  [
    "ABORT_ALREADY_PENDING",
    "ABORT ALREADY PENDING {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "АБОРТ УЖЕ В ОЖИДАНИИ {1}"
  ],
  [
    "ADJOURN_ALREADY_PENDING",
    "ADJOURN ALREADY PENDING {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "ADJOURN УЖЕ В ОЖИДАНИИ {1}"
  ],
  [
    "DRAW_ACCEPTED",
    "DRAW ACCEPTED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "РИСУНОК ПРИНЯТО {1}"
  ],
  [
    "DRAW_DECLINED",
    "DRAW DECLINED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "РИСУНОК ОТКЛОНЕН {1]"
  ],
  [
    "ABORT_ACCEPTED",
    "ABORT ACCEPTED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ НАЙДЕНО {1}"
  ],
  [
    "ADJOURN_ACCEPTED",
    "ADJOURN ACCEPTED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "ПРИЛОЖЕНИЕ ПРИНЯТО {1}"
  ],
  [
    "ABORT_DECLINED",
    "ABORT DECLINED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "АБОРТ ОТКЛОНЕН {1}"
  ],
  [
    "ADJOURN_DECLINED",
    "ADJOURN DECLINED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "ADJOURN ОТКЛОНЕН {1}"
  ],
  [
    "NOT_AN_EXAMINER",
    "NOT AN EXAMINER {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ ЭКСПЕРТ {1}"
  ],
  [
    "END_OF_GAME",
    "END OF GAME {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "конец игры {1}"
  ],
  [
    "INVALID_VARIATION",
    "INVALID VARIATION {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "недопустимый вариант изменения {1}"
  ],
  [
    "VARIATION_REQUIRED",
    "VARIATION REQUIRED {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "ВАРИАЦИЯ ТРЕБУЕТСЯ {1}"
  ],
  [
    "UNABLE_TO_PLAY_OPPONENT",
    "UNABLE TO PLAY OPPONENT {1}",
    "El mensaje con el valor {1} como valor de parámetro",
    "Невозможно играть противником {1}"
  ],
  ["SERVER_ERROR", "SERVER_ERROR. message={1} reason={2}", "SERVER_ERROR", "SERVER_ERROR"]
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
