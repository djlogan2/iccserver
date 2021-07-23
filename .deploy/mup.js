module.exports = {
  servers: {
    one: {
      host: "v2.chessclub.com",
      username: "deploy",
      pem: "~/.ssh/deploy_id_rsa"
    }
  },

  app: {
    deployCheckWaitTime: 300,
    enableUploadProgressBar: true,
    name: "iccserver",
    path: "../",

    servers: {
      one: {}
    },

    buildOptions: {
      serverOnly: true,
      debug: true
    },

    env: {
      ROOT_URL: "https://v2.chessclub.com",
      MONGO_URL: "mongodb://mongodb/meteor",
      MONGO_OPLOG_URL: "mongodb://mongodb/local"
    },

    docker: {
      image: "iccserver_base"
    }
  },

  mongo: {
    version: "3.6.3",
    servers: {
      one: {}
    }
  },
  hooks: {
    'pre.deploy': {
      localCommand: 'echo "export const current_release={\\"release\\":" "\\""`git describe --tag`"\\", \\"commit\\":\\""`git rev-parse HEAD`"\\"}" > ../imports/startup/release.js'
    },
    // 'pre.meteor.start': {
    //   remoteCommand: "sudo chmod -v -R 777 /opt/iccserver"
    // }
  },
  proxy: {
    domains: "v2.chessclub.com",
    ssl: {
      forceSSL: true,
      letsEncryptEmail: "eng@chessclub.com"
    }
  }
};
