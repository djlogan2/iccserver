import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { renderRoutes } from "../imports/startup/client/routes.jsx";
import i18n from "meteor/universe:i18n";

import "../lib/client/timestamp";

Meteor.startup(() => {
  i18n.addTranslations("en-US", {
    Common: {
      loginForm: {
        login: "Login",
        email: "email",
        password: "password",
        submit: "submit"
      },
      signupForm: {
        signup: "Sign Up",
        name: "Name",
        email: "Email Address",
        password: "Password",
        submit: "Submit"
      },
      rightBarTop: {
        game: "Game",
        play: "Play",
        tournaments: "Tournaments"
      },
      menuLinkLabel: {
        play: "Play",
        learn: "Learn",
        connect: "Connect",
        examine: "Examine",
        topPlayers: "Top Players",
        logIn: "Log in",
        singUp: "Sign up",
        help: "Help"
      },
      actionButtonLabel: {
        takeBack: "Take Back",
        draw: "Draw",
        resign: "Resign",
        abort: "Abort"
      },
      rightBarBottom: {
        chat: "Chat",
        events: "Events",
        friends: "Friends",
        fen_pgn: "FEN/PGN",
        history: "History"
      }
    }
  });
  i18n.addTranslations("ru-RU", {
    Common: {
      loginForm: {
        login: "Добро пожаловать в пожа пожаxc ловатьлов ать !",
        email: "пожаловать",
        password: "passwпожаxc",
        submit: "ать"
      },
      signupForm: {
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
      loginForm: {
        login: "お忘れでですか",
        email: "パスワードをお忘れですか",
        password: "パ-ードをお忘",
        submit: "忘れです忘れです"
      },
      signupForm: {
        signup: "お忘れでですか",
        name: "ードをお忘",
        email: "をお忘 ドをお忘",
        password: "をお忘 ドを",
        submit: "忘 ドを"
      },
      rightBarTop: {
        game: "ドを",
        play: "ドをay",
        tournaments: "ドをドを"
      },
      rightBarBottom: {
        chat: "ドを",
        events: "ドをay",
        friends: "ドをドを",
        fen_pgn: "FEN/PGN",
        history: "ドをドを"
      },
      menuLinkLabel: {
        play: "ドを",
        learn: "ドをaドをr",
        connect: "ドを",
        examine: "ドを",
        topPlayers: "とあ事片そ",
        logIn: "ドを ドをドを",
        singUp: "とあ事片そ",
        help: "ドを"
      },
      actionButtonLabel: {
        takeBack: "とあ事片",
        draw: "とあ片そ",
        resign: "とあ事",
        abort: "とあ片そ"
      }
    }
  });

  i18n.setOptions({
    defaultLocale: "en-US"
  });
  render(renderRoutes(), document.getElementById("target"));
});
