module.exports = {
  servers: {
    one: {
      host: "v2.chessclub.com",
      username: "david",
      pem: "~/.ssh/id_rsa",
    },
  },

  app: {
    deployCheckWaitTime: 300,
    enableUploadProgressBar: true,
    name: "iccserver",
    path: "../",

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
      debug: false,
    },

    env: {
      ROOT_URL: "https://v2.chessclub.com",
      MONGO_URL: "mongodb://mongodb/meteor",
      MONGO_OPLOG_URL: "mongodb://mongodb/local",
      SLACK_CHANNEL_LINK: "https://hooks.slack.com/services/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",
      SLACK_CHANNEL_NAME: "#notifications-prod",
    },

    docker: {
      image: "iccserver_base",
    },
  },

  mongo: {
    version: "3.6.3",
    servers: {
      one: {},
    },
  },
  hooks: {
    "pre.deploy": {
      localCommand:
        'echo "export const current_release={\\"release\\":" "\\""`git describe --tag`"\\", \\"commit\\":\\""`git rev-parse HEAD`"\\"}" > ../imports/startup/release.js',
    },
  },
  proxy: {
    domains: "v2.chessclub.com,ctychess.chessclub.com",
    ssl: {
      forceSSL: true,
      letsEncryptEmail: "eng@chessclub.com",
    },
  },
};
