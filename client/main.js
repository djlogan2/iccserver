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
      },
      chatBoxMessage: {
        NEW_MESSAGE: "NEW MESSAGE",
        MATCH_DECLINED: "MATCH DECLINED",
        CANNOT_MATCH_LOGGED_OFF_USER: "CANNOT MATCH LOGGED OFF USER",
        NO_MATCH_FOUND: "NO MATCH FOUND",
        TAKEBACK_ACCEPTED: "TAKEBACK ACCEPTED",
        NOT_PLAYING_A_GAME: "NOT PLAYING A GAME",
        NO_TAKEBACK_PENDING: "NO TAKEBACK PENDING",
        TAKEBACK_DECLINED: "TAKEBACK DECLINED",
        DRAW_ALREADY_PENDING: "DRAW ALREADY PENDING",
        ABORT_ALREADY_PENDING: "ABORT ALREADY PENDING",
        ADJOURN_ALREADY_PENDING: "ADJOURN ALREADY PENDING",
        DRAW_ACCEPTED: "DRAW ACCEPTED",
        DRAW_DECLINED: "DRAW DECLINED",
        ABORT_ACCEPTED: "ABORT ACCEPTED",
        ADJOURN_ACCEPTED: "ADJOURN ACCEPTED",
        ABORT_DECLINED: "ABORT DECLINED",
        ADJOURN_DECLINED: "ADJOURN DECLINED",
        NOT_AN_EXAMINER: "NOT AN EXAMINER",
        END_OF_GAME: "END OF GAME",
        INVALID_VARIATION: "INVALID VARIATION",
        VARIATION_REQUIRED: "VARIATION REQUIRED",
        UNABLE_TO_PLAY_OPPONENT: "UNABLE TO PLAY OPPONENT"
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
      },
      chatBoxMessage: {
        NEW_MESSAGE: "НОВОЕ СООБЩЕНИЕ",
        MATCH_DECLINED: "МАТЧ ОТКЛОНЕН",
        CANNOT_MATCH_LOGGED_OFF_USER:
          "НЕ МОЖЕТ СОГЛАСОВАТЬСЯ, ВЫЙТИ ИЗ ПОЛЬЗОВАТЕЛЯ",
        NO_MATCH_FOUND: "НЕ НАЙДЕНО",
        TAKEBACK_ACCEPTED: "ПРИНЯТЬ ОБРАТНО ПРИНЯТО",
        NOT_PLAYING_A_GAME: "НЕ ИГРАТЬ В ИГРУ",
        NO_TAKEBACK_PENDING: "НЕТ ВЕРНУТЬ В ОЖИДАНИИ",
        TAKEBACK_DECLINED: "TAKEBACK DECLINED",
        DRAW_ALREADY_PENDING: "ВЕРНУТЬСЯ ОТКЛОНЕНО",
        ABORT_ALREADY_PENDING: "АБОРТ УЖЕ В ОЖИДАНИИ",
        ADJOURN_ALREADY_PENDING: "ADJOURN УЖЕ В ОЖИДАНИИ",
        DRAW_ACCEPTED: "РИСУНОК ПРИНЯТО",
        DRAW_DECLINED: "РИСУНОК ОТКЛОНЕН",
        ABORT_ACCEPTED: "АБОРТ ПРИНЯТ",
        ADJOURN_ACCEPTED: "ПРИЛОЖЕНИЕ ПРИНЯТО",
        ABORT_DECLINED: "АБОРТ ОТКЛОНЕН",
        ADJOURN_DECLINED: "ADJOURN ОТКЛОНЕН",
        NOT_AN_EXAMINER: "НЕ ЭКСПЕРТ",
        END_OF_GAME: "конец игры",
        INVALID_VARIATION: "недопустимый вариант изменения",
        VARIATION_REQUIRED: "ВАРИАЦИЯ ТРЕБУЕТСЯ",
        UNABLE_TO_PLAY_OPPONENT: "Невозможно играть противником"
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
      },
      chatBoxMessage: {
        MATCH_DECLINED: "MATCH DECLINED",
        CANNOT_MATCH_LOGGED_OFF_USER: "CANNOT MATCH LOGGED OFF USER",
        NO_MATCH_FOUND: "NO MATCH FOUND",
        TAKEBACK_ACCEPTED: "TAKEBACK ACCEPTED",
        NOT_PLAYING_A_GAME: "NOT PLAYING A GAME",
        NO_TAKEBACK_PENDING: "NO TAKEBACK PENDING",
        TAKEBACK_DECLINED: "TAKEBACK DECLINED",
        DRAW_ALREADY_PENDING: "DRAW ALREADY PENDING",
        ABORT_ALREADY_PENDING: "ABORT ALREADY PENDING",
        ADJOURN_ALREADY_PENDING: "ADJOURN ALREADY PENDING",
        DRAW_ACCEPTED: "DRAW ACCEPTED",
        ABORT_ACCEPTED: "ABORT_ACCEPTED",
        ADJOURN_ACCEPTED: "ADJOURN ACCEPTED",
        ABORT_DECLINED: "ABORT DECLINED",
        ADJOURN_DECLINED: "ADJOURN DECLINED",
        NOT_AN_EXAMINER: "NOT AN EXAMINER",
        END_OF_GAME: "END OF GAME",
        INVALID_VARIATION: "INVALID VARIATION",
        VARIATION_REQUIRED: "VARIATION REQUIRED",
        UNABLE_TO_PLAY_OPPONENT: "UNABLE_TO_PLAY_OPPONENT"
      }
    }
  });

  i18n.setOptions({
    defaultLocale: "en-US"
  });
  render(renderRoutes(), document.getElementById("target"));
});
