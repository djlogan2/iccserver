module.exports = {
  servers: {
    one: {
      host: "localhost",
      username: "davidlogan",
      password: "ca014dedjl"
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
      ROOT_URL: "http://localhost",
      MONGO_URL: "mongodb://localhost:27017/iccserver",
      MONGO_OPLOG_URL: "mongodb://localhost:27017/local"
    },

    docker: {
      image: "iccserver_base"
    }
  }
};
