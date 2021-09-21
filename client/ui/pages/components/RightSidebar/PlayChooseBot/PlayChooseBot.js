import React, { Component } from "react";
import { Button, Form, InputNumber, Radio, Switch, Typography } from "antd";
import { translate } from "../../../../HOCs/translate";
import {
  findRatingObject,
  getMaxInitialAndIncOrDelayTime,
} from "../../../../../../lib/ratinghelpers";
import {
  DynamicRatingsCollection,
  mongoCss,
} from "../../../../../../imports/api/client/collections";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import { Meteor } from "meteor/meteor";
import {
  CHALLENGER_INCREMENT_DELAY_TYPE,
  INCREMENT_OR_DELAY_TYPE_NONE,
  RECEIVER_INCREMENT_DELAY_TYPE,
} from "../../../../../constants/gameConstants";

const { Title } = Typography;

class PlayChooseBot extends Component {
  constructor(props) {
    super(props);

    const matchDefaults = Meteor.user()?.settings?.match_default;

    this.state = {
      timeOdds: false,
      difficulty: 5,
      color: "random",
      challengerIncrementOrDelayType: matchDefaults?.challenger_delaytype || "inc",
      challengerInitial: matchDefaults?.challenger_time || 15,
      challengerIncrementOrDelay: matchDefaults?.challenger_inc_or_delay || 1,
      challengerRatingType: "none",
      receiverIncrementOrDelayType: matchDefaults?.challenger_delaytype || "inc",
      receiverInitial: matchDefaults?.challenger_time || 15,
      receiverIncrementOrDelay: matchDefaults?.challenger_inc_or_delay || 1,
      receiverRatingType: "none",
    };
  }

  componentDidMount() {
    this.updateRating();
  }

  handleChangeDifficulty = (e) => {
    this.setState({
      difficulty: e.target.value,
    });
  };

  handleChangeColor = (e) => {
    this.setState({
      color: e.target.value,
    });
  };

  handleChangeIncrementOrDelayType = (incrementOrDelayType) => (e) => {
    this.setState({
      [incrementOrDelayType]: e.target.value,
    });
  };

  handleChange = (inputName) => (number) => {
    this.setState({ [inputName]: number }, () => {
      this.updateRating();
    });
  };

  updateRating = () => {
    const {
      challengerIncrementOrDelayType,
      challengerInitial,
      challengerIncrementOrDelay,
      receiverIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
    } = this.state;

    const challengerRatingType = findRatingObject(
      0,
      "white", // Right now white and black always match, so just hard code
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      DynamicRatingsCollection.find().fetch()
    );

    const receiverRatingType = findRatingObject(
      0,
      "white",
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      DynamicRatingsCollection.find().fetch()
    );

    if (challengerRatingType && receiverRatingType) {
      this.setState({
        challengerRatingType: challengerRatingType.rating_type,
        receiverRatingType: receiverRatingType.rating_type,
      });
    }
  };

  handlePlay = () => {
    const { onPlay } = this.props;

    let { color } = this.state;
    const {
      timeOdds,
      challengerRatingType,
      receiverRatingType,
      difficulty,
      challengerIncrementOrDelayType,
      receiverIncrementOrDelayType,
      challengerInitial,
      receiverInitial,
      challengerIncrementOrDelay,
      receiverIncrementOrDelay,
    } = this.state;

    if (timeOdds) {
      onPlay({
        challengerRatingType,
        receiverRatingType,
        color: color === "random" ? null : color,
        challengerIncrementOrDelayType,
        receiverIncrementOrDelayType,
        challengerInitial,
        receiverInitial,
        challengerIncrementOrDelay,
        receiverIncrementOrDelay,
        skillLevel: difficulty,
      });
    } else {
      onPlay({
        challengerRatingType,
        receiverRatingType: challengerRatingType,
        color: color === "random" ? null : color,
        challengerIncrementOrDelayType,
        receiverIncrementOrDelayType: challengerIncrementOrDelayType,
        challengerInitial,
        receiverInitial: challengerInitial,
        challengerIncrementOrDelay,
        receiverIncrementOrDelay: challengerIncrementOrDelay,
        skillLevel: difficulty,
      });
    }
  };

  render() {
    const { onClose, translate, ratings, classes } = this.props;
    const {
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      challengerRatingType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      receiverRatingType,
      difficulty,
      color,
      timeOdds,
    } = this.state;

    const { maxInitialValue, maxIncOrDelayValue } = getMaxInitialAndIncOrDelayTime(ratings);

    return (
      <div className={classes.main}>
        <div className={classes.head}>
          <h2 className={classes.nameTitle}>{translate("playWithComputer")}</h2>
          <div>
            <Button
              id="start-the-game-button"
              type="primary"
              className={classes.startGameButton}
              onClick={this.handlePlay}
            >
              {translate("startTheGame")}
            </Button>
            <Button id="back-button" onClick={onClose}>
              {translate("back")}
            </Button>
          </div>
        </div>
        <Form
          layout="vertical"
          initialValues={{
            challengerInitial,
            challengerIncrementOrDelay,
            receiverInitial,
            receiverIncrementOrDelay,
          }}
        >
          <Form.Item label={translate("time_odds")} name="time-odds">
            <Switch
              defaultChecked={timeOdds}
              onChange={(timeOdds) => this.setState({ timeOdds })}
            />
          </Form.Item>
          {timeOdds && <Title level={5}>{translate("challenger")}</Title>}
          <Form.Item label={translate("timeControl")} name="challenger-time-control">
            <Radio.Group
              name="challengerTimeControl"
              onChange={this.handleChangeIncrementOrDelayType(CHALLENGER_INCREMENT_DELAY_TYPE)}
              defaultValue={challengerIncrementOrDelayType}
              value={challengerIncrementOrDelayType}
            >
              <Radio.Button value="inc">{translate("control.inc")}</Radio.Button>
              <Radio.Button value="none">{translate("control.none")}</Radio.Button>
              <Radio.Button value="us">{translate("control.us")}</Radio.Button>
              <Radio.Button value="bronstein">{translate("control.bronstein")}</Radio.Button>
            </Radio.Group>
            <div className={classes.incDelayWrap}>
              <Form.Item
                className={classes.incDelayItem}
                label={translate("initial")}
                name="challengerInitial"
                rules={[{ required: true, message: "Initial is required" }]} // TODO: DJL - Is this message internationalized?
              >
                <InputNumber
                  name="challengerInitial"
                  min={challengerIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE ? 1 : 0}
                  id="challengerInitial"
                  parser={(value) => Math.round(value)}
                  formatter={(value) => Math.round(value)}
                  max={maxInitialValue}
                  value={challengerInitial}
                  onChange={this.handleChange("challengerInitial")}
                />
              </Form.Item>
              {challengerIncrementOrDelayType !== INCREMENT_OR_DELAY_TYPE_NONE && (
                <Form.Item
                  className={classes.incDelayItem}
                  label={translate("incrementOrDelay")}
                  name="challengerIncrementOrDelay"
                  rules={[
                    {
                      required: !(challengerIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE),
                    },
                  ]}
                >
                  <InputNumber
                    name="challengerIncrementOrDelay"
                    min={1}
                    parser={(value) => Math.round(value)}
                    formatter={(value) => Math.round(value)}
                    max={maxIncOrDelayValue}
                    value={challengerIncrementOrDelay}
                    onChange={this.handleChange("challengerIncrementOrDelay")}
                  />
                </Form.Item>
              )}
            </div>
          </Form.Item>
          <Form.Item label={translate("ratingType")} name="challengerRatingType">
            <p>{translate(`ratings.${challengerRatingType}`)}</p>
          </Form.Item>
          {timeOdds && (
            <>
              <Title level={5}>{translate("receiver")}</Title>
              <Form.Item label={translate("timeControl")} name="receiver-time-control">
                <Radio.Group
                  name="receiverTimeControl"
                  onChange={this.handleChangeIncrementOrDelayType(RECEIVER_INCREMENT_DELAY_TYPE)}
                  defaultValue={receiverIncrementOrDelayType}
                  value={receiverIncrementOrDelayType}
                >
                  <Radio.Button value="inc">{translate("control.inc")}</Radio.Button>
                  <Radio.Button value="none">{translate("control.none")}</Radio.Button>
                  <Radio.Button value="us">{translate("control.us")}</Radio.Button>
                  <Radio.Button value="bronstein">{translate("control.bronstein")}</Radio.Button>
                </Radio.Group>
                <div className={classes.incDelayWrap}>
                  <Form.Item
                    className={classes.incDelayItem}
                    label={translate("initial")}
                    name="receiverInitial"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <InputNumber
                      name="receiverInitial"
                      min={receiverIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE ? 1 : 0}
                      id="receiverInitial"
                      max={maxInitialValue}
                      parser={(value) => Math.round(value)}
                      formatter={(value) => Math.round(value)}
                      value={receiverInitial}
                      onChange={this.handleChange("receiverInitial")}
                    />
                  </Form.Item>
                  {receiverIncrementOrDelayType !== INCREMENT_OR_DELAY_TYPE_NONE && (
                    <Form.Item
                      className={classes.incDelayItem}
                      label={translate("incrementOrDelay")}
                      name="receiverIncrementOrDelay"
                      rules={[
                        {
                          required: !(
                            receiverIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        name="receiverIncrementOrDelay"
                        min={1}
                        parser={(value) => Math.round(value)}
                        formatter={(value) => Math.round(value)}
                        max={maxIncOrDelayValue}
                        value={challengerIncrementOrDelay}
                        onChange={this.handleChange("receiverIncrementOrDelay")}
                      />
                    </Form.Item>
                  )}
                </div>
              </Form.Item>
              <Form.Item label={translate("ratingType")} name="receiverRatingType">
                <p>{translate(`ratings.${receiverRatingType}`)}</p>
              </Form.Item>
            </>
          )}
          <Form.Item label={translate("difficulty")} name="difficulty">
            <Radio.Group
              name="difficulty"
              value={difficulty}
              defaultValue={difficulty}
              onChange={this.handleChangeDifficulty}
            >
              <Radio.Button value={0}>0</Radio.Button>
              <Radio.Button value={1}>1</Radio.Button>
              <Radio.Button value={2}>2</Radio.Button>
              <Radio.Button value={3}>3</Radio.Button>
              <Radio.Button value={4}>4</Radio.Button>
              <Radio.Button value={5}>5</Radio.Button>
              <Radio.Button value={6}>6</Radio.Button>
              <Radio.Button value={7}>7</Radio.Button>
              <Radio.Button value={8}>8</Radio.Button>
              <Radio.Button value={9}>9</Radio.Button>
              <Radio.Button value={10}>10</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={translate("color")} name="color">
            <Radio.Group
              name="color"
              value={color}
              defaultValue={color}
              onChange={this.handleChangeColor}
            >
              <Radio.Button value="random">{translate("colors.random")}</Radio.Button>
              <Radio.Button value="white">{translate("colors.white")}</Radio.Button>
              <Radio.Button value="black">{translate("colors.black")}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      ratings: DynamicRatingsCollection.find().fetch(),
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Play.PlayChooseBot")
)(PlayChooseBot);
