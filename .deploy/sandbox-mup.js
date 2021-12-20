module.exports = {
  servers: {
    one: {
      host: "sandbox.chessclub.com",
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
      ROOT_URL: "https://sandbox.chessclub.com",
      MONGO_URL: "mongodb://mongodb/meteor",
      MONGO_OPLOG_URL: "mongodb://mongodb/local",
      SLACK_CHANNEL_LINK: "https://hooks.slack.com/services/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",
      SLACK_CHANNEL_NAME: "#notifications-prod",
      PUBLICASSETS_S3_BUCKET: "chessclub-com-v2-sandbox-assets",
      MUGSHOTS_S3_BUCKET: "chessclub-com-v2-sandbox-mugshots",
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
        'chmod 777 ./db/db_dump && ./db/db_dump && echo "export const current_release={\\"release\\":" "\\""`git describe --tag`"\\", \\"commit\\":\\""`git rev-parse HEAD`"\\"}" > ../imports/startup/release.js',
    },
  },
  proxy: {
    domains: "sandbox.chessclub.com, ctychess.chessclub.com",
    ssl: {
      forceSSL: true,
      letsEncryptEmail: "eng@chessclub.com",
    },
  },
};
