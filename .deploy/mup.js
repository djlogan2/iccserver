module.exports = {
  servers: {
    one: {
      host: "100.25.103.111",
      username: "oleshkoo",
      pem: "~/.ssh/prod-icc"
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
      debug: false
    },

    env: {
      ROOT_URL: "http://100.25.103.111",
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
    }
  }
};
