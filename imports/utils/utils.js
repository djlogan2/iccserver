export const updateLocale = locale => {
  const localeArray = locale.split("-");

  if (localeArray && localeArray.length === 2) {
    localeArray[1].toUpperCase();
  }

  return localeArray.join("-");
};
