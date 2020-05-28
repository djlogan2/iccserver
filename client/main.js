import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "react-dom";
import { renderRoutes } from "../imports/startup/client/routes.jsx";
import i18n from "meteor/universe:i18n";
import "../lib/client/timestamp";
import { Logger } from "../lib/client/Logger";

const log = new Logger("client/main_js");

Meteor.startup(() => {
  Accounts.onLogin(function() {
    Meteor.logoutOtherClients(function(error) {
      if (error) {
        log.error(error);
      }
    });
  });
  // TODO: Hey guys, this should be in the database. It shouldn't be hard coded like this.
  //       You can make your own collection, I suppose, but it seems to me it would make sense
  //       to put it in ClientMessages, and maybe even just use a meteor method? I'm not sure
  //       whata this package does, but you can't leave this like this.
  i18n.addTranslations("en-US", {
    Common: {
      HomeContainer: {
        mainContent: "xxxx"
      },
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
        tournaments: "Tournaments",
        quikpairing: "Quick Pairing",
        seekgame: "Seek a Game",
        matchuser: "Match User"
      },
      menuLinkLabel: {
        play: "Play",
        learn: "Learn",
        connect: "Connect",
        examine: "Examine",
        topPlayers: "Top Players",
        logIn: "Log in",
        singUp: "Sign up",
        help: "Help",
        logout: "Logout",
        mygame: "My Games",
        uploadpgn: "Imported PGNs"
      },
      MoveListComponent: {
        takeBack: "Take Back",
        draw: "Draw",
        resign: "Resign",
        abort: "Abort",
        Gamestatus: "Game status",
        examining: "Examining",
        playing: "Playing"
      },
      rightBarBottom: {
        chat: "Chat",
        events: "Events",
        friends: "Friends",
        fen_pgn: "FEN/PGN",
        history: "History"
      },
      MatchUserSubTab: {
        friends: "Friends",
        recentOpponent: "Recent Opponent"
      },
      GameForm: {
        timeControl: "Time Control",
        minutes: "Minutes",
        secondPerMove: "Seconds per move",
        typeOfGame: "Type of Game",
        rated: "Rated",
        incrementOrDelayType: "Increment Or DelayType",
        inc: "Inc",
        us: "Us",
        bronstein: "Bronstein",
        pickAcolor: "Pick a color",
        white: "White",
        black: "Black",
        random: "Random",
        submit: "Submit"
      },
      GameRequestPopup: {
        accept: "Accept",
        decline: "Decline"
      },
      GamenotificationPopup: {
        close: "Close"
      },
      GameResignedPopup: {
        close: "Close"
      },
      ExaminActionPopup: {
        email: "Email",
        complaint: "Complaint",
        submit: "Submit"
      },
      ActionPopup: {},
      MainPage: {
        gamerequest: " has requested for a game",
        gameresign: "Opponent has resigned a game",
        halfmove: "Take Back 1 Move",
        fullmove: "Take Back 2 Moves",
        abort: "Abort",
        draw: "Draw"
      },
      MiddleBoard: {
        yourturn: "( Your Turn )",
        waitingforopponent: "( waiting for opponent )"
      },
      chatBoxMessage: {
        NEW_MESSAGE: "NEW MESSAGE"
      }
    }
  });
  i18n.addTranslations("ru-RU", {
    Common: {
      HomeContainer: {
        mainContent: "xxxx"
      },
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
      MatchUserSubTab: {
        friends: "пожвать",
        recentOpponent: "ватьпожвать"
      },
      GameForm: {
        timeControl: "passwпожаxc",
        minutes: "passwпожаxc",
        secondPerMove: "Spasswпожаxcove",
        typeOfGame: "ловатьловать",
        rated: "пожаь",
        pickAcolor: "пожа л овать",
        white: "пожаловать",
        black: "пожвать",
        random: "пожа ловать",
        submit: "пожаx"
      },
      chatBoxMessage: {
        NEW_MESSAGE: "пожа ловать"
      }
    }
  });
  i18n.addTranslations("ja", {
    Common: {
      HomeContainer: {
        mainContent: "お忘れ"
      },
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
        tournaments: "ドをドを",
        quikpairing: "ドをドを",
        seekgame: "ドをドをドをドを",
        matchuser: "ドドド"
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
        help: "ドを",
        mygame: "ドを ド"
      },
      MoveListComponent: {
        takeBack: "とあ事片",
        draw: "とあ片そ",
        resign: "とあ事",
        abort: "とあ片そ",
        Gamestatus: "とあ片そ",
        examining: "Exaとあ片そmining",
        playing: "とあ片"
      }
    }
  });

  i18n.setOptions({
    defaultLocale: "en-US"
  });
  render(renderRoutes(), document.getElementById("target"));
});
