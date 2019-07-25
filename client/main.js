import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '../imports/startup/client/routes.jsx';
import i18n from "meteor/universe:i18n";

Meteor.startup(() => {
                       /* i18n.addTranslations("en-US", {
    Common: {
      welcome: "Welcome user!",
      Login: "Log In",
      Email: "Email Address",
      Password: "Password",
      hello_world: "HELLO WORLD",
      ForgotPassword: "Forgot Password?"
    }
  });
  i18n.addTranslations("de-DE", {
    Common: {
      welcome: "Welcosame tso the Shsaop Fu!",
      Login: "Einloggen",
      Email: "E-Maildde-Addresse",
      Password: "Passfdwort",
      hello_world: "HELLO WORLD SPANISH",
      ForgotPassword: "Passwort vergessen?"
    }
  });
  i18n.addTranslations("ja", {
    Common: {
      welcome: "ログインログインログイン電子メールアドレスログインログイン",
      Login: "ログイン",
      Email: "電子メールアドレス",
      Password: "パスワード",
      hello_world: "HELLO WORLD Japanes",
      ForgotPassword: "パスワードをお忘れですか"
    }
  });
  */
                       function getLang() {
                         return (navigator.browserLanguage || "en-US"
                         );
                       }
                       console.log("Meteor started", getLang());

                       i18n.setLocale(getLang());

                       render(
                         renderRoutes(),
                         document.getElementById("target")
                       );
                     });
