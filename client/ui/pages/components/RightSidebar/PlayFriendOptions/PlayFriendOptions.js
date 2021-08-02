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

class PlayFriendOptions extends Component {
  constructor(props) {
    super(props);

    const roles = props.currentRoles.map((role) => role.role._id);
    const isRatedGames = roles.includes(ROLE_PLAY_RATED_GAMES);
    const isUnratedGames = roles.includes(ROLE_PLAY_UNRATED_GAMES);

    const matchDefaults = Meteor.user()?.settings?.match_default;

    this.state = {
      isRatedGames,
      isUnratedGames,
      color: "random",
      incrementOrDelayType: matchDefaults?.challenger_delaytype || "inc",
      initial: matchDefaults?.challenger_time || 15,
      incrementOrDelay: matchDefaults?.challenger_inc_or_delay || 0,
      ratingType: matchDefaults?.rating_type || "none",
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

  handleChangeIncrementOrDelayType = (e) => {
    this.setState({
      incrementOrDelayType: e.target.value,
    });
  };

  handleChange = (inputName) => {
    return (number) => {
      const newState = {};

      newState[inputName] = number;

      this.setState(newState, () => {
        this.updateRating();
      });
    };
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
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      ratingType,
      color,
      isRatedGames,
      isUnratedGames,
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
            initial,
            incrementOrDelay,
            color,
          }}
        >
          <Form.Item label={translate("timeControl")} name="time-control">
            <Radio.Group
              name="timeControl"
              onChange={this.handleChangeIncrementOrDelayType}
              value={incrementOrDelayType}
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
                rules={[{ required: !(incrementOrDelayType === "none") }]}
              >
                <InputNumber
                  name="initial"
                  min={0}
                  max={maxInitialValue}
                  disabled={incrementOrDelayType === "none"}
                  value={initial}
                  onChange={this.handleChange("initial")}
                />
              </Form.Item>
              <Form.Item
                className={classes.incDelayItem}
                label={translate("incrementOrDelay")}
                name="incrementOrDelay"
                rules={[{ required: !(incrementOrDelayType === "none") }]}
              >
                <InputNumber
                  name="incrementOrDelay"
                  min={0}
                  max={maxIncOrDelayValue}
                  disabled={incrementOrDelayType === "none"}
                  value={incrementOrDelay}
                  onChange={this.handleChange("incrementOrDelay")}
                />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label={translate("ratingType")} name="ratingType">
            <p>{translate(`ratings.${ratingType}`)}</p>
          </Form.Item>
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
