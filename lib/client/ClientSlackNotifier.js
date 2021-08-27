import slackNotifiy from "slack-notify";

class ClientSlackNotifier {
  constructor(hookUrl) {
    this.slackNotifier = slackNotifiy(hookUrl);
  }

  sendLog = ({ message, identifier, userId }) => {
    if (process.env.NODE_ENV !== "development") {
      this.slackNotifier.send({
        channel: process.env.SLACK_CHANNEL_NAME,
        text: `Message: ${message}\nMessage identifier: ${identifier}\nUser id: ${userId}`,
        username: "Notifications bot",
      });
    }
  };
}

export default ClientSlackNotifier;
