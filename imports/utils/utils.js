export const updateLocale = locale => {
  const localeArray = locale.split("-");

  if (localeArray && localeArray.length === 2) {
    localeArray[1].toUpperCase();
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
