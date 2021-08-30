import React, { Component } from "react";
import { findRatingObject, getMaxInitialAndIncOrDelayTime } from "../../../../../../lib/ratinghelpers";
import { DynamicRatingsCollection, mongoCss } from "../../../../../../imports/api/client/collections";
import { Button, Form, InputNumber, Radio, Switch } from "antd";
import { translate } from "../../../../HOCs/translate";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { ROLE_PLAY_RATED_GAMES, ROLE_PLAY_UNRATED_GAMES } from "../../../../../constants/rolesConstants";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import { CHALLENGER_INCREMENT_DELAY_TYPE, INCREMENT_OR_DELAY_TYPE_NONE } from "../../../../../constants/gameConstants";

class PlayFriendOptions extends Component {
  constructor(props) {
    super(props);

    const roles = props.currentRoles.map((role) => role.role._id);
    const isRatedGames = roles.includes(ROLE_PLAY_RATED_GAMES);
    const isUnratedGames = roles.includes(ROLE_PLAY_UNRATED_GAMES);

    const matchDefaults = Meteor.user()?.settings?.match_default;

    console.log(matchDefaults);
    this.state = {
      timeOdds: false,
      isRatedGames,
      isUnratedGames,
      color: "random",
      challengerIncrementOrDelayType: matchDefaults?.challenger_delaytype || "inc",
      challengerInitial: matchDefaults?.challenger_time || 15,
      challengerIncrementOrDelay: matchDefaults?.challenger_inc_or_delay || 1,
      challengerRatingType: "none",
      receiverIncrementOrDelayType: matchDefaults?.challenger_delaytype || "inc",
      receiverInitial: matchDefaults?.challenger_time || 15,
      receiverIncrementOrDelay: matchDefaults?.challenger_inc_or_delay || 1,
      receiverRatingType: "none",
      rated: isRatedGames,
    };
  }

  componentDidMount() {
    this.updateRating();
  }

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
    const { initial, incrementOrDelay, incrementOrDelayType } = this.state;

    const ratingObject = findRatingObject(
      0,
      "white", // Right now white and black always match, so just hard code
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      DynamicRatingsCollection.find().fetch()
    );

    if (ratingObject) {
      this.setState({ ratingType: ratingObject.rating_type });
    }
  };

  handlePlay = () => {
    const { onPlay } = this.props;

    let { color } = this.state;
    const { ratingType, incrementOrDelayType, initial, incrementOrDelay, rated } = this.state;

    onPlay({
      rated,
      ratingType,
      color: color === "random" ? null : color,
      incrementOrDelayType,
      initial,
      incrementOrDelay,
    });
  };

  render() {
    const { onClose, translate, classes } = this.props;
    const {
      rated,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      challengerRatingType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      receiverRatingType,
      color,
      isRatedGames,
      isUnratedGames,
      timeOdds,
    } = this.state;

    const { maxInitialValue, maxIncOrDelayValue } = getMaxInitialAndIncOrDelayTime(
      DynamicRatingsCollection.find().fetch()
    );

    return (
      <div className={classes.main}>
        <div className={classes.head}>
          <h2 className={classes.nameTitle}>{translate("createGame")}</h2>
          <Button id="back-button" onClick={onClose}>
            {translate("BACK")}
          </Button>
        </div>
        <Form
          layout="vertical"
          initialValues={{
            challengerInitial,
            receiverInitial,
            challengerIncrementOrDelay,
            receiverIncrementOrDelay,
            color,
          }}
        >
          <Form.Item label={translate("timeOdds")} name="time-odds">
            <Switch
              defaultChecked={timeOdds}
              onChange={(timeOdds) => this.setState({ timeOdds })}
            />
          </Form.Item>
          <Form.Item label={translate("timeControl")} name="time-control">
            <Radio.Group
              name="timeControl"
              onChange={this.handleChangeIncrementOrDelayType(CHALLENGER_INCREMENT_DELAY_TYPE)}
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
                name="initial"
                rules={[
                  { required: !(challengerIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE) },
                ]}
              >
                <InputNumber
                  name="initial"
                  min={0}
                  max={maxInitialValue}
                  value={challengerInitial}
                  onChange={this.handleChange("initial")}
                />
              </Form.Item>
              {challengerIncrementOrDelayType !== INCREMENT_OR_DELAY_TYPE_NONE && (
                <Form.Item
                  className={classes.incDelayItem}
                  label={translate("incrementOrDelay")}
                  name="incrementOrDelay"
                  rules={[
                    {
                      required: !(challengerIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE),
                    },
                  ]}
                >
                  <InputNumber
                    name="incrementOrDelay"
                    min={1}
                    max={maxIncOrDelayValue}
                    value={challengerIncrementOrDelay}
                    onChange={this.handleChange("incrementOrDelay")}
                  />
                </Form.Item>
              )}
            </div>
          </Form.Item>
          <Form.Item label={translate("ratingType")} name="ratingType">
            <p>{translate(`ratings.${challengerRatingType}`)}</p>
          </Form.Item>
          {timeOdds && (
            <>
              <Form.Item label={translate("timeControl")} name="time-control-receiver">
                <Radio.Group
                  name="timeControlReceiver"
                  onChange={this.handleChangeIncrementOrDelayType}
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
                    name="initial"
                    rules={[
                      {
                        required: !(receiverIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE),
                      },
                    ]}
                  >
                    <InputNumber
                      name="initial"
                      min={0}
                      max={maxInitialValue}
                      value={receiverInitial}
                      onChange={this.handleChange("initial")}
                    />
                  </Form.Item>
                  {receiverIncrementOrDelayType !== INCREMENT_OR_DELAY_TYPE_NONE && (
                    <Form.Item
                      className={classes.incDelayItem}
                      label={translate("incrementOrDelay")}
                      name="incrementOrDelay"
                      rules={[
                        {
                          required: !(
                            receiverIncrementOrDelayType === INCREMENT_OR_DELAY_TYPE_NONE
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        name="incrementOrDelay"
                        min={1}
                        max={maxIncOrDelayValue}
                        value={receiverIncrementOrDelay}
                        onChange={this.handleChange("incrementOrDelay")}
                      />
                    </Form.Item>
                  )}
                </div>
              </Form.Item>
              <Form.Item label={translate("ratingType")} name="ratingType">
                <p>{translate(`ratings.${receiverRatingType}`)}</p>
              </Form.Item>
            </>
          )}
          <Form.Item label={translate("color")} name="color">
            <Radio.Group name="color" onChange={this.handleChangeColor} value={color}>
              <Radio.Button value="random">{translate("colors.random")}</Radio.Button>
              <Radio.Button value="white">{translate("colors.white")}</Radio.Button>
              <Radio.Button value="black">{translate("colors.black")}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={translate("isRated")} name="rated">
            <Switch
              defaultChecked={rated}
              disabled={!isRatedGames || !isUnratedGames}
              onChange={(rated) => this.setState({ rated })}
            />
          </Form.Item>
          <Button id="select-opponent-button" type="primary" onClick={this.handlePlay}>
            {translate("selectOpponent")}
          </Button>
        </Form>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      currentRoles: Meteor.roleAssignment.find().fetch(),
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Play.PlayFriendOptions")
)(PlayFriendOptions);
