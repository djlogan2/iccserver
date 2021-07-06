import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import MoveList from "../MoveList";
import CssManager from "../../../../Css/CssManager";

describe("MoveList component", () => {
  const mockProps = {
    game: {
      _id: "Ny8QZkbXpTYZX4n4s",
      actions: [
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: {
            move: "e4",
            lag: 0,
            ping: 0,
            gamelag: 0,
            gameping: 0,
          },
          time: { $date: "2021-07-02T10:40:54.423Z" },
        },
        {
          type: "move",
          issuer: "hws8pZ6pFpqM6LDAa",
          parameter: {
            move: "e5",
            lag: 0,
            ping: 0,
            gamelag: 0,
            gameping: 0,
          },
          time: { $date: "2021-07-02T10:40:59.517Z" },
        },
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: {
            move: "c4",
            lag: 0,
            ping: 0,
            gamelag: 0,
            gameping: 0,
          },
          time: { $date: "2021-07-02T10:40:59.572Z" },
        },
        {
          type: "resign",
          issuer: "WwbX9ELoQgJFzQHQc",
          time: { $date: "2021-07-02T10:42:58.138Z" },
        },
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: "d5",
          time: { $date: "2021-07-06T08:46:54.523Z" },
        },
        {
          type: "move_backward",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: 1,
          time: { $date: "2021-07-06T08:46:57.667Z" },
        },
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: "c5",
          time: { $date: "2021-07-06T08:46:58.856Z" },
        },
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: "d4",
          time: { $date: "2021-07-06T08:47:03.877Z" },
        },
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: "cxd4",
          time: { $date: "2021-07-06T08:47:05.869Z" },
        },
        {
          type: "move_backward",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: 1,
          time: { $date: "2021-07-06T08:47:07.095Z" },
        },
        {
          type: "move",
          issuer: "WwbX9ELoQgJFzQHQc",
          parameter: "exd4",
          time: { $date: "2021-07-06T08:47:08.181Z" },
        },
      ],
      black: {
        id: "hws8pZ6pFpqM6LDAa",
        name: "test",
        rating: 1474,
      },
      clocks: {
        white: {
          initial: 10,
          inc_or_delay: 0,
          delaytype: "inc",
          current: 597364,
          starttime: 1625222459515,
        },
        black: {
          initial: 10,
          inc_or_delay: 0,
          delaytype: "inc",
          current: 594944,
          starttime: 1625222459570,
        },
      },
      computer_variations: [],
      examiners: [
        {
          id: "WwbX9ELoQgJFzQHQc",
          username: "aleks1",
        },
        {
          id: "hws8pZ6pFpqM6LDAa",
          username: "test",
        },
      ],
      fen: "rnbqkbnr/pp1p1ppp/8/2p5/2PpP3/8/PP3PPP/RNBQKBNR w KQkq - 0 4",
      isolation_group: "public",
      lag: {
        white: {
          active: [
            {
              id: "zaMZ5ayKcgrQWtmk8",
              originate: 1625222452811,
            },
            {
              id: "xFn8bhuuT5MzmjuqD",
              originate: 1625222453815,
            },
            {
              id: "oJ5zo3wxkfSZsG7JE",
              originate: 1625222454813,
            },
            {
              id: "zXycFbtHdAzEycx6A",
              originate: 1625222455813,
            },
            {
              id: "EoLfFm3MKFRAzSYDq",
              originate: 1625222456813,
            },
            {
              id: "DxRheeK5wLHCwDwiQ",
              originate: 1625222457813,
            },
            {
              id: "4iKMpcDbdBdcGodQ9",
              originate: 1625222458813,
            },
            {
              id: "r2WdzWz2wt2hYmHQq",
              originate: 1625222459813,
            },
            {
              id: "69jDgMxsTgxuFhpx2",
              originate: 1625222460813,
            },
            {
              id: "fJHxerDKyRnpSq97C",
              originate: 1625222461813,
            },
            {
              id: "zpuxHmmLpS3q3Cc4G",
              originate: 1625222462813,
            },
            {
              id: "FgL66gix3J75uR3kY",
              originate: 1625222463813,
            },
            {
              id: "CqHXG7injeXxg5mRx",
              originate: 1625222464813,
            },
            {
              id: "BbmBErEZaxswNZpsg",
              originate: 1625222465813,
            },
            {
              id: "GXqCPXmZheNuGXdXQ",
              originate: 1625222466813,
            },
            {
              id: "Hyogqgk2vNpkndrY5",
              originate: 1625222467813,
            },
            {
              id: "7KCsFswcF86bbS78i",
              originate: 1625222468814,
            },
            {
              id: "FGbNbFb8RjqPtXDhB",
              originate: 1625222469814,
            },
            {
              id: "iQmabaaMuA3mXdQtN",
              originate: 1625222470814,
            },
            {
              id: "Rikn27pEjQ9XxxSer",
              originate: 1625222471815,
            },
            {
              id: "fDTfT2Bn9NLuKPAm3",
              originate: 1625222472814,
            },
            {
              id: "BEMst3oD8a39muwmk",
              originate: 1625222473818,
            },
            {
              id: "cGX4WHzsajq5tGFc6",
              originate: 1625222474814,
            },
            {
              id: "d5FDxuj5FobKhQvy7",
              originate: 1625222475814,
            },
            {
              id: "aXJ5AYSiqSQcyzh8s",
              originate: 1625222476814,
            },
            {
              id: "9MJJfBbtLRJhxDFvM",
              originate: 1625222477814,
            },
            {
              id: "7oPBqDBtLjmcpT3xt",
              originate: 1625222478815,
            },
            {
              id: "dFtxbi9nkKvdNBaSG",
              originate: 1625222479816,
            },
            {
              id: "4ec662fxdbSNEfAbw",
              originate: 1625222480816,
            },
            {
              id: "3eneXCBQGqb3bfnG7",
              originate: 1625222481816,
            },
            {
              id: "cdSKSfYJyvLG3wvjz",
              originate: 1625222482816,
            },
            {
              id: "qK8qKymYr7bP2amfA",
              originate: 1625222483816,
            },
            {
              id: "p9EKSzu7fwwDzmGMy",
              originate: 1625222484818,
            },
            {
              id: "hjdRFWdZRjELJTvMu",
              originate: 1625222485818,
            },
            {
              id: "hCRjBaiNR6owCgNvv",
              originate: 1625222486827,
            },
            {
              id: "dyC2X4b773NRaAZt2",
              originate: 1625222487833,
            },
            {
              id: "XePTpGbm33Kzm8zuJ",
              originate: 1625222488827,
            },
            {
              id: "eEumrzwsGeXMJAzDc",
              originate: 1625222489827,
            },
            {
              id: "7GTT8dthEEApEsctM",
              originate: 1625222490827,
            },
            {
              id: "6rStXe8todjRgspRa",
              originate: 1625222491828,
            },
            {
              id: "bD7Rzc2eFXHBYo66i",
              originate: 1625222492827,
            },
            {
              id: "wtXq9M5BbzFr5gGMz",
              originate: 1625222493827,
            },
            {
              id: "yNYrZJqwMmnnTKRMm",
              originate: 1625222494827,
            },
            {
              id: "KpAu4ovbsGedvLCW7",
              originate: 1625222495828,
            },
            {
              id: "7BLYjJcC9YWKmeNqa",
              originate: 1625222496828,
            },
            {
              id: "WzNiWZ2mTd9nbyZM6",
              originate: 1625222497839,
            },
            {
              id: "3PHbo4nmx7YfkdxwN",
              originate: 1625222498839,
            },
            {
              id: "cKY4gTxdLdJT4hAdo",
              originate: 1625222499864,
            },
            {
              id: "PJyFy3E8f2HiGtpBt",
              originate: 1625222500863,
            },
            {
              id: "Yzd6LEEW3HMjuTv7B",
              originate: 1625222501863,
            },
            {
              id: "hk8jPGc5SEiX8TE6e",
              originate: 1625222502864,
            },
            {
              id: "ii6wob3sDiMwFQQog",
              originate: 1625222503864,
            },
            {
              id: "xoownYQdMJn8Cu33H",
              originate: 1625222504864,
            },
            {
              id: "WuSxRGFnsQrHyMv9a",
              originate: 1625222505864,
            },
          ],
          pings: [],
        },
        black: {
          active: [
            {
              id: "ykLzupE6LAzYEWyGn",
              originate: 1625222452814,
            },
            {
              id: "WvYxZQxjbzHSNdsuT",
              originate: 1625222453818,
            },
            {
              id: "XefET8Q8ovAimZdPJ",
              originate: 1625222454817,
            },
            {
              id: "bJn5feNcDLC7k226v",
              originate: 1625222455820,
            },
            {
              id: "S76MNzYtvYzRP2fEu",
              originate: 1625222456820,
            },
            {
              id: "Qfy7fmkEwfGgFsgHW",
              originate: 1625222457821,
            },
            {
              id: "hWRNvCaBTbvqdHeBv",
              originate: 1625222458825,
            },
            {
              id: "2hKxkDSquBRHqAYEt",
              originate: 1625222459825,
            },
            {
              id: "FXwntFqBuN7LBBhjQ",
              originate: 1625222460825,
            },
            {
              id: "qy5juwazxKGxS9AD4",
              originate: 1625222461825,
            },
            {
              id: "banf5vz9iBogcWEdQ",
              originate: 1625222462825,
            },
            {
              id: "BNASkyQMYcre5dwxX",
              originate: 1625222463825,
            },
            {
              id: "4sD2KnZ7wwJcxrBmA",
              originate: 1625222464825,
            },
            {
              id: "siFqiyYmYbNQ3s85P",
              originate: 1625222465825,
            },
            {
              id: "x7jrG5ECAtDfJEMBC",
              originate: 1625222466825,
            },
            {
              id: "FwzYkvaToMuYAuuHu",
              originate: 1625222467826,
            },
            {
              id: "MCwv3fGRRjaHrj8nj",
              originate: 1625222468826,
            },
            {
              id: "fzrNnjJsFm4QCSowD",
              originate: 1625222469826,
            },
            {
              id: "JdkT5qFctq3WK8Lut",
              originate: 1625222470826,
            },
            {
              id: "ZCX2qrwe6LpF8tfoC",
              originate: 1625222471826,
            },
            {
              id: "JKzcenaeqzKEuFxnb",
              originate: 1625222472826,
            },
            {
              id: "DtL7iXMBLWX2zfwZe",
              originate: 1625222473827,
            },
            {
              id: "uW6gCCEpoA22JDNSJ",
              originate: 1625222474827,
            },
            {
              id: "kcgvbo75Fw2P9NeZH",
              originate: 1625222475827,
            },
            {
              id: "xLqDwEuFKMBB3emKN",
              originate: 1625222476827,
            },
            {
              id: "ohHiYRhrjYes5rP96",
              originate: 1625222477827,
            },
            {
              id: "d5bKqw9aFFwgW8QDR",
              originate: 1625222478829,
            },
            {
              id: "JJx8WH9xkhv3xFm9g",
              originate: 1625222479829,
            },
            {
              id: "69MP4SoJs3eXDyz2G",
              originate: 1625222480829,
            },
            {
              id: "mpRiwxosgaHSysmr5",
              originate: 1625222481831,
            },
            {
              id: "RdJNQq9Rk9vPJpPMh",
              originate: 1625222482829,
            },
            {
              id: "HXPe8KLZFcjKPT3Sy",
              originate: 1625222483831,
            },
            {
              id: "YY3eamApWbc8CMe67",
              originate: 1625222484835,
            },
            {
              id: "d7uJpt23kn9PSfAj2",
              originate: 1625222485835,
            },
            {
              id: "23owGKqxaJhbFMzk7",
              originate: 1625222486838,
            },
            {
              id: "mMnYsbJmyadENW8HB",
              originate: 1625222487850,
            },
            {
              id: "57dW7RM89tJBSe3Qi",
              originate: 1625222488850,
            },
            {
              id: "SsKqGGc9hr9nLFAjo",
              originate: 1625222489850,
            },
            {
              id: "ZocsKg9rbGQRMvTy3",
              originate: 1625222490850,
            },
            {
              id: "XecjuJJKWeYbfpRvy",
              originate: 1625222491861,
            },
            {
              id: "Soe6qSrdTEex8nuWw",
              originate: 1625222492861,
            },
            {
              id: "Pr9Q2mmeSThn7WfPc",
              originate: 1625222493861,
            },
            {
              id: "3dWAmFJwzeHQpD4jw",
              originate: 1625222494863,
            },
            {
              id: "TGDjy8P4vDeG6tc3Y",
              originate: 1625222495861,
            },
            {
              id: "gwkvPj9Lc4Wchwm2t",
              originate: 1625222496862,
            },
            {
              id: "cHKGzjgtjTu7NiqYu",
              originate: 1625222497868,
            },
            {
              id: "J86jNnLoK8acLuJ36",
              originate: 1625222498885,
            },
            {
              id: "FoGoSc4ynisnYWuE5",
              originate: 1625222499885,
            },
            {
              id: "9zmY5HiZeqixPm2T9",
              originate: 1625222500885,
            },
            {
              id: "ZAonBxoRhaNEYSdRN",
              originate: 1625222501885,
            },
            {
              id: "3JzsBdEBeHQrfgHbX",
              originate: 1625222502886,
            },
            {
              id: "XNJ2sFKozJTfm2YsF",
              originate: 1625222503885,
            },
            {
              id: "7wBcnMoDB8srZm8Kr",
              originate: 1625222504885,
            },
            {
              id: "L846AWPoc3afBWe66",
              originate: 1625222505887,
            },
          ],
          pings: [],
        },
      },
      observers: [
        {
          id: "WwbX9ELoQgJFzQHQc",
          username: "aleks1",
        },
        {
          id: "hws8pZ6pFpqM6LDAa",
          username: "test",
        },
      ],
      rated: true,
      rating_type: "blitz",
      result: "0-1",
      startTime: { $date: "2021-07-02T10:40:51.788Z" },
      status: "examining",
      status2: 0,
      tomove: "black",
      variations: {
        cmi: 8,
        movelist: [
          {
            variations: [1],
          },
          {
            move: "e4",
            smith: {
              piece: "p",
              color: "w",
              from: "e2",
              to: "e4",
            },
            prev: 0,
            current: 600000,
            variations: [2],
          },
          {
            move: "e5",
            smith: {
              piece: "p",
              color: "b",
              from: "e7",
              to: "e5",
            },
            prev: 1,
            current: 600000,
            variations: [3],
          },
          {
            move: "c4",
            smith: {
              piece: "p",
              color: "w",
              from: "c2",
              to: "c4",
            },
            prev: 2,
            current: 597380,
            variations: [4, 5],
          },
          {
            move: "d5",
            smith: {
              piece: "p",
              color: "b",
              from: "d7",
              to: "d5",
            },
            prev: 3,
            current: null,
          },
          {
            move: "c5",
            smith: {
              piece: "p",
              color: "b",
              from: "c7",
              to: "c5",
            },
            prev: 3,
            current: null,
            variations: [6],
          },
          {
            move: "d4",
            smith: {
              piece: "p",
              color: "w",
              from: "d2",
              to: "d4",
            },
            prev: 5,
            current: null,
            variations: [7, 8],
          },
          {
            move: "cxd4",
            smith: {
              piece: "p",
              color: "b",
              from: "c5",
              to: "d4",
            },
            prev: 6,
            current: null,
          },
          {
            move: "exd4",
            smith: {
              piece: "p",
              color: "b",
              from: "e5",
              to: "d4",
            },
            prev: 6,
            current: null,
          },
        ],
        ecocodes: [],
      },
      white: {
        id: "WwbX9ELoQgJFzQHQc",
        name: "aleks1",
        rating: 1624,
      },
      wild: 0,
    },
    cssManager: new CssManager({}, {}),
  };

  const component = mount(<MoveList {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });
});
