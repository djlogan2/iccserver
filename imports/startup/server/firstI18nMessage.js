import { i18nCollection } from "./../../collections/i18n";
import { Meteor } from "meteor/meteor";

//["messageid", "en_us", "es", "ru"]
const messages = [
  [
    "MATCH_DECLINED",
    "MATCH DECLINED",
    "El mensaje con el valor {1} como valor de parámetro",
    "МАТЧ ОТКЛОНЕН"
  ],
  [
    "CANNOT_MATCH_LOGGED_OFF_USER",
    "CANNOT MATCH LOGGED OFF USER",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ"
  ],
  [
    "NO_MATCH_FOUND",
    "NO MATCH FOUND",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ НАЙДЕНО"
  ],
  [
    "TAKEBACK_ACCEPTED",
    "TAKEBACK ACCEPTED",
    "El mensaje con el valor {1} como valor de parámetro",
    "ПРИНЯТЬ ОБРАТНО ПРИНЯТО"
  ],
  [
    "NOT_PLAYING_A_GAME",
    "NOT PLAYING A GAME",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ ИГРАТЬ В ИГРУ"
  ],
  [
    "NO_TAKEBACK_PENDING",
    "NO TAKEBACK PENDING",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕТ ВЕРНУТЬ В ОЖИДАНИИ"
  ],
  [
    "TAKEBACK_DECLINED",
    "TAKEBACK DECLINED",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ НАЙДЕНО"
  ],
  [
    "DRAW_ALREADY_PENDING",
    "DRAW ALREADY PENDING",
    "El mensaje con el valor {1} como valor de parámetro",
    "ВЕРНУТЬСЯ ОТКЛОНЕНО"
  ],
  [
    "ABORT_ALREADY_PENDING",
    "ABORT ALREADY PENDING",
    "El mensaje con el valor {1} como valor de parámetro",
    "АБОРТ УЖЕ В ОЖИДАНИИ"
  ],
  [
    "ADJOURN_ALREADY_PENDING",
    "ADJOURN ALREADY PENDING",
    "El mensaje con el valor {1} como valor de parámetro",
    "ADJOURN УЖЕ В ОЖИДАНИИ"
  ],
  [
    "DRAW_ACCEPTED",
    "DRAW ACCEPTED",
    "El mensaje con el valor {1} como valor de parámetro",
    "РИСУНОК ПРИНЯТО"
  ],
  [
    "DRAW_DECLINED",
    "DRAW DECLINED",
    "El mensaje con el valor {1} como valor de parámetro",
    "РИСУНОК ОТКЛОНЕН"
  ],
  [
    "ABORT_ACCEPTED",
    "ABORT ACCEPTED",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ НАЙДЕНО"
  ],
  [
    "ADJOURN_ACCEPTED",
    "ADJOURN ACCEPTED",
    "El mensaje con el valor {1} como valor de parámetro",
    "ПРИЛОЖЕНИЕ ПРИНЯТО"
  ],
  [
    "ABORT_DECLINED",
    "ABORT DECLINED",
    "El mensaje con el valor {1} como valor de parámetro",
    "АБОРТ ОТКЛОНЕН"
  ],
  [
    "ADJOURN_DECLINED",
    "ADJOURN DECLINED",
    "El mensaje con el valor {1} como valor de parámetro",
    "ADJOURN ОТКЛОНЕН"
  ],
  [
    "NOT_AN_EXAMINER",
    "NOT AN EXAMINER",
    "El mensaje con el valor {1} como valor de parámetro",
    "НЕ ЭКСПЕРТ"
  ],
  [
    "END_OF_GAME",
    "END OF GAME",
    "El mensaje con el valor {1} como valor de parámetro",
    "конец игры"
  ],
  [
    "INVALID_VARIATION",
    "INVALID VARIATION",
    "El mensaje con el valor {1} como valor de parámetro",
    "недопустимый вариант изменения"
  ],
  [
    "VARIATION_REQUIRED",
    "VARIATION REQUIRED",
    "El mensaje con el valor {1} como valor de parámetro",
    "ВАРИАЦИЯ ТРЕБУЕТСЯ"
  ],
  [
    "UNABLE_TO_PLAY_OPPONENT",
    "UNABLE TO PLAY OPPONENT",
    "El mensaje con el valor {1} como valor de parámetro",
    "Невозможно играть противником"
  ]
];

export default function firstAddI18nMessage() {
  if (!Meteor.isTest && !Meteor.isAppTest && i18nCollection.find().count() === 0) {
    i18nCollection.rawCollection().createIndex({ messageid: 1, locale: 1 }, { unique: true });
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
