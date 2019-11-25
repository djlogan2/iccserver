//TODO : i am not sure can we define all i18n message in collection 
// then required message we can find
const i18nCollectionMessageDoc = [
  {
    type: "server",
    messageid: "cannotMatchUser",
    text: {
      en_us: "CANNOT MATCH LOGGED OFF USER",
      es: "El mensaje con el valor {1} como valor de parámetro",
      fr_xx: "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ"
    }
  },
  {
    type: "server",
    messageid: "gameDecline",
    text: {
      en_us: "MATCH DECLINED",
      es: "El mensaje con el valor {1} como valor de parámetro",
      fr_xx: "МАТЧ ОТКЛОНЕН"
    }
  },
  {
    type: "ClientServer",
    messageid: "matchRequest",
    text: {
      en_us: "CANNOT MATCH LOGGED OFF USER",
      es: "El mensaje con el valor {1} como valor de parámetro",
      fr_xx: "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ"
    }
  },
  {
    type: "OnlyClient",
    messageid: "MATCH_DECLINED",
    text: {
      en_us: "MATCH DECLINED",
      es: "El mensaje con el valor {1} como valor de parámetro",
      fr_xx: "МАТЧ ОТКЛОНЕН"
    }
  }
];
export { i18nCollectionMessageDoc };
