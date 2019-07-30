import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { renderRoutes } from "../imports/startup/client/routes.jsx";
import i18n from "meteor/universe:i18n";

Meteor.startup(() => {
  i18n.addTranslations("en-US", {
    Common: {
      loginform: {
        login: "Login",
        email: "email",
        password: "password",
        submit: "submit"
      },
      signupform: {
        signup: "Sign Up",
        name: "Name",
        email: "Email Address",
        password: "Password",
        submit: "Submit"
      },
      RightBarTop: {
        Game: "Game",
        Play: "Play",
        Tournaments: "Tournaments"
      }
    }
  });
  i18n.addTranslations("ru-RU", {
    Common: {
      loginform: {
        login: "Добро пожаловать в пожа пожаxc ловатьлов ать !",
        email: "пожаловать",
        password: "passwпожаxc",
        submit: "ать"
      },
      signupform: {
        signup: "пожа пожаxc",
        name: "по жаxc",
        email: "пожаловать",
        password: "passwпожаxc",
        submit: "ать"
      }
    }
  });
  i18n.addTranslations("ja", {
    Common: {
      loginform: {
        login: "お忘れでですか",
        email: "パスワードをお忘れですか",
        password: "パ-ードをお忘",
        submit: "忘れです忘れです"
      },
      signupform: {
        signup: "お忘れでですか",
        name: "ードをお忘",
        email: "をお忘 ドをお忘",
        password: "をお忘 ドを",
        submit: "忘 ドを"
      },
      RightBarTop: {
        Game: "ドを",
        Play: "ドをay",
        Tournaments: "ドをドを"
      }
    }
  });

  i18n.setOptions({
    defaultLocale: "en-US"
  });
  render(renderRoutes(), document.getElementById("target"));
});
