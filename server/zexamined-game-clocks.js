describe.only("Clocks in examined games", function () {
  it("should create the clocks object in the game record upon load", function () {
    const game_id = Game.startLocalExaminedGameWithObject("mi1", game_history_game);
    const game = Game.GameCollection.findOne();
    chai.assert.equal(5*60*1000)
    chai.assert.fail("do me");
  });
  it("should set the clocks to the time value upon load", function () {
    chai.assert.fail("do me");
  });
  it("should set the clocks to zero if there is no time value upon load", function () {
    chai.assert.fail("do me");
  });
  it("should use the current and previous nodes to set the clocks on move forward", function () {
    chai.assert.fail("do me");
  });
  it("should use the current and previous nodes to set the clocks on move backward", function () {
    chai.assert.fail("do me");
  });
  it("should use the current and previous nodes to set the clocks on setcmi", function () {
    chai.assert.fail("do me");
  });
  it("should just set a clock to zero if the associated node does not have clock information", function () {
    chai.assert.fail("do me");
  });
  it("should allow an examiner to set the current nodes clock", function () {
    chai.assert.fail("do me");
  });
});

const game_history_game = {
  _id: "yykvKqcCkH5QPNdLC",
  actions: [
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "e4",
      },
      time: { $date: "2020-07-29T17:34:15.020Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "c6",
      },
      time: { $date: "2020-07-29T17:34:15.021Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "d4",
      },
      time: { $date: "2020-07-29T17:34:15.021Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "e6",
      },
      time: { $date: "2020-07-29T17:34:15.021Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "c4",
      },
      time: { $date: "2020-07-29T17:34:15.021Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "h5",
      },
      time: { $date: "2020-07-29T17:34:15.022Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "e5",
      },
      time: { $date: "2020-07-29T17:34:15.022Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "d6",
      },
      time: { $date: "2020-07-29T17:34:15.022Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Nf3",
      },
      time: { $date: "2020-07-29T17:34:15.022Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "dxe5",
      },
      time: { $date: "2020-07-29T17:34:15.023Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Nxe5",
      },
      time: { $date: "2020-07-29T17:34:15.023Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "f6",
      },
      time: { $date: "2020-07-29T17:34:15.023Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Nf3",
      },
      time: { $date: "2020-07-29T17:34:15.023Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "b5",
      },
      time: { $date: "2020-07-29T17:34:15.024Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "cxb5",
      },
      time: { $date: "2020-07-29T17:34:15.024Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "a6",
      },
      time: { $date: "2020-07-29T17:34:15.024Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "bxc6",
      },
      time: { $date: "2020-07-29T17:34:15.024Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Nxc6",
      },
      time: { $date: "2020-07-29T17:34:15.024Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Nc3",
      },
      time: { $date: "2020-07-29T17:34:15.025Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Nge7",
      },
      time: { $date: "2020-07-29T17:34:15.025Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Be3",
      },
      time: { $date: "2020-07-29T17:34:15.025Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Rb8",
      },
      time: { $date: "2020-07-29T17:34:15.025Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Be2",
      },
      time: { $date: "2020-07-29T17:34:15.026Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Rxb2",
      },
      time: { $date: "2020-07-29T17:34:15.026Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "O-O",
      },
      time: { $date: "2020-07-29T17:34:15.026Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Nd5",
      },
      time: { $date: "2020-07-29T17:34:15.026Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Ne4",
      },
      time: { $date: "2020-07-29T17:34:15.027Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "f5",
      },
      time: { $date: "2020-07-29T17:34:15.027Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Nc5",
      },
      time: { $date: "2020-07-29T17:34:15.027Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Nc3",
      },
      time: { $date: "2020-07-29T17:34:15.027Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Qe1",
      },
      time: { $date: "2020-07-29T17:34:15.030Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Qa5",
      },
      time: { $date: "2020-07-29T17:34:15.030Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Kh1",
      },
      time: { $date: "2020-07-29T17:34:15.030Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Rxe2",
      },
      time: { $date: "2020-07-29T17:34:15.031Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Qc1",
      },
      time: { $date: "2020-07-29T17:34:15.031Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Nxa2",
      },
      time: { $date: "2020-07-29T17:34:15.031Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Rxa2",
      },
      time: { $date: "2020-07-29T17:34:15.031Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Qxa2",
      },
      time: { $date: "2020-07-29T17:34:15.031Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Qb1",
      },
      time: { $date: "2020-07-29T17:34:15.032Z" },
    },
    {
      type: "move",
      issuer: "computer",
      parameter: {
        move: "Be7",
      },
      time: { $date: "2020-07-29T17:34:15.032Z" },
    },
    {
      type: "move",
      issuer: "BkhGRAbkEDcSEvotJ",
      parameter: {
        move: "Qxa2",
      },
      time: { $date: "2020-07-29T17:34:15.032Z" },
    },
  ],
  black: {
    id: "computer",
    name: "Computer",
    rating: 1600,
  },
  clocks: {
    white: {
      initial: 5,
      inc_or_delay: 0,
      delaytype: "none",
    },
    black: {
      initial: 5,
      inc_or_delay: 0,
      delaytype: "none",
    },
  },
  computer_variations: [],
  isolation_group: "cty",
  rated: false,
  rating_type: "blitz",
  result: "1-0",
  startTime: { $date: "2021-08-07T20:00:59.520Z" },
  status2: 2,
  variations: {
    movelist: [
      {
        variations: [1],
      },
      {
        move: "e4",
        prev: 0,
        current: 300000,
        variations: [2],
      },
      {
        move: "c6",
        prev: 1,
        current: 300000,
        variations: [3],
      },
      {
        move: "d4",
        prev: 2,
        current: 298494,
        variations: [4],
      },
      {
        move: "e6",
        prev: 3,
        current: 257972,
        variations: [5],
      },
      {
        move: "c4",
        prev: 4,
        current: 293858,
        variations: [6],
      },
      {
        move: "h5",
        prev: 5,
        current: 222328,
        variations: [7],
      },
      {
        move: "e5",
        prev: 6,
        current: 247200,
        variations: [8],
      },
      {
        move: "d6",
        prev: 7,
        current: 190981,
        variations: [9],
      },
      {
        move: "Nf3",
        prev: 8,
        current: 220647,
        variations: [10],
      },
      {
        move: "dxe5",
        prev: 9,
        current: 167339,
        variations: [11],
      },
      {
        move: "Nxe5",
        prev: 10,
        current: 183284,
        variations: [12],
      },
      {
        move: "f6",
        prev: 11,
        current: 149188,
        variations: [13],
      },
      {
        move: "Nf3",
        prev: 12,
        current: 148545,
        variations: [14],
      },
      {
        move: "b5",
        prev: 13,
        current: 126478,
        variations: [15],
      },
      {
        move: "cxb5",
        prev: 14,
        current: 145005,
        variations: [16],
      },
      {
        move: "a6",
        prev: 15,
        current: 106717,
        variations: [17],
      },
      {
        move: "bxc6",
        prev: 16,
        current: 142042,
        variations: [18],
      },
      {
        move: "Nxc6",
        prev: 17,
        current: 89443,
        variations: [19],
      },
      {
        move: "Nc3",
        prev: 18,
        current: 139586,
        variations: [20],
      },
      {
        move: "Nge7",
        prev: 19,
        current: 75763,
        variations: [21],
      },
      {
        move: "Be3",
        prev: 20,
        current: 138205,
        variations: [22],
      },
      {
        move: "Rb8",
        prev: 21,
        current: 62427,
        variations: [23],
      },
      {
        move: "Be2",
        prev: 22,
        current: 136638,
        variations: [24],
      },
      {
        move: "Rxb2",
        prev: 23,
        current: 50860,
        variations: [25],
      },
      {
        move: "O-O",
        prev: 24,
        current: 135589,
        variations: [26],
      },
      {
        move: "Nd5",
        prev: 25,
        current: 40918,
        variations: [27],
      },
      {
        move: "Ne4",
        prev: 26,
        current: 134460,
        variations: [28],
      },
      {
        move: "f5",
        prev: 27,
        current: 32434,
        variations: [29],
      },
      {
        move: "Nc5",
        prev: 28,
        current: 132233,
        variations: [30],
      },
      {
        move: "Nc3",
        prev: 29,
        current: 25163,
        variations: [31],
      },
      {
        move: "Qe1",
        prev: 30,
        current: 129743,
        variations: [32],
      },
      {
        move: "Qa5",
        prev: 31,
        current: 19873,
        variations: [33],
      },
      {
        move: "Kh1",
        prev: 32,
        current: 121680,
        variations: [34],
      },
      {
        move: "Rxe2",
        prev: 33,
        current: 15278,
        variations: [35],
      },
      {
        move: "Qc1",
        prev: 34,
        current: 119827,
        variations: [36],
      },
      {
        move: "Nxa2",
        prev: 35,
        current: 10733,
        variations: [37],
      },
      {
        move: "Rxa2",
        prev: 36,
        current: 116602,
        variations: [38],
      },
      {
        move: "Qxa2",
        prev: 37,
        current: 6769,
        variations: [39],
      },
      {
        move: "Qb1",
        prev: 38,
        current: 114477,
        variations: [40],
      },
      {
        move: "Be7",
        prev: 39,
        current: 3486,
        variations: [41],
      },
      {
        move: "Qxa2",
        prev: 40,
        current: 112162,
      },
    ],
  },
  white: {
    id: "BkhGRAbkEDcSEvotJ",
    name: "Ruy",
    rating: 1600,
  },
  wild: 0,
};
