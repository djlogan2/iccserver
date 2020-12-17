export const gameExampleObject = {
  _id: "YiaXtYD4eQKigz9SS",
  result: "1-0",
  fen: "rnbqkbnr/pp1ppppp/2p5/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  tomove: "white",
  white: {
    id: "sBAs6EKd49Z6yNT7Z",
    name: "amit",
    rating: 1600
  },
  black: {
    id: "zzrqD3toyyg9zDsnC",
    name: "kalpesh",
    rating: 1600
  },
  wild: 0,
  rating_type: "standard",
  rated: true,
  clocks: {
    white: {
      initial: 14,
      inc_or_delay: 1,
      delaytype: "inc",
      current: 838525,
      starttime: 1579876933173
    },
    black: {
      initial: 14,
      inc_or_delay: 1,
      delaytype: "inc",
      current: 838674,
      starttime: 1579876930786
    }
  },
  status: "examining",
  actions: [
    {
      type: "move",
      issuer: "sBAs6EKd49Z6yNT7Z",
      parameter: {
        move: "e3",
        lag: 12,
        ping: 61,
        gamelag: 75,
        gameping: 93
      },
      time: "2020-01-24T14:42:10.788Z"
    },
    {
      type: "move",
      issuer: "zzrqD3toyyg9zDsnC",
      parameter: {
        move: "c6",
        lag: 1,
        ping: 2,
        gamelag: 12,
        gameping: 101
      },
      time: "2020-01-24T14:42:13.175Z"
    },
    {
      type: "resign",
      issuer: "zzrqD3toyyg9zDsnC",
      time: "2020-01-24T14:42:14.624Z"
    }
  ],
  observers: [
    {
      id: "sBAs6EKd49Z6yNT7Z",
      username: "amit"
    },
    {
      id: "zzrqD3toyyg9zDsnC",
      username: "kalpesh"
    }
  ],
  variations: {
    hmtb: 0,
    cmi: 2,
    movelist: [
      {
        variations: [1]
      },
      {
        move: "e3",
        prev: 0,
        current: 840000,
        variations: [2]
      },
      {
        move: "c6",
        prev: 1,
        current: 840073
      }
    ]
  },
  lag: {
    white: {
      active: [],
      pings: [57, 93, 51, 45, 30, 37]
    },
    black: {
      active: [],
      pings: [143, 203, 124, 101, 77, 81]
    }
  },
  startTime: "2020-01-24T14:42:14.624Z",
  examiners: [
    {
      id: "sBAs6EKd49Z6yNT7Z",
      username: "amit"
    },
    {
      id: "zzrqD3toyyg9zDsnC",
      username: "kalpesh"
    }
  ]
};