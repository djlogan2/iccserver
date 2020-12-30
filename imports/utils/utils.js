import _ from "lodash";

export const updateLocale = locale => {
  const localeArray = locale.split("-");

  if (localeArray && localeArray.length === 2) {
    localeArray[1] = localeArray[1].toUpperCase();
  }

  return localeArray.join("-");
};

export const isReadySubscriptions = subscriptions => {
  for (const k in subscriptions) {
    if (!subscriptions[k].ready()) {
      return false;
    }
  }

  return true;
};

export const getLang = () =>
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.browserLanguage ||
  navigator.userLanguage ||
  "en-US";

export const areArraysOfObectsEqual = (firstArray, secondArray) => {
  return _(firstArray)
    .differenceWith(secondArray, _.isEqual)
    .isEmpty();
};
