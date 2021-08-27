import slackNotifiy from "slack-notify";

class ServerSlackNotifier {
  constructor(hookUrl) {
    this.slackNotifier = slackNotifiy(hookUrl);
  }

  sendLog = ({ message, date }) => {
    if (process.env.NODE_ENV !== "development") {
      this.slackNotifier.send({
        channel: process.env.SLACK_CHANNEL_NAME,
        text: `${date} ${message}`,
        username: "Notifications bot",
      });
    }
  };

  sendMeteorError = ({ message, reason, message_identifier, userId }) => {
    if (process.env.NODE_ENV !== "development") {
      this.slackNotifier.send({
        channel: process.env.SLACK_CHANNEL_NAME,
        text: `Message: ${message} \nReason: ${reason} \nMessage identifier: ${message_identifier}\nUser id: ${userId}`,
        username: "Notifications bot",
      });
    }
  };
}

export default ServerSlackNotifier;
