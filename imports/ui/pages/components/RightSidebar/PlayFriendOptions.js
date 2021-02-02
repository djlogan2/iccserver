import React, { Component } from "react";
import { findRatingObject, getMaxInitialAndIncOrDelayTime } from "../../../../../lib/ratinghelpers";
import { DynamicRatingsCollection } from "../../../../api/client/collections";
import { Button, Form, InputNumber, Radio } from "antd";
import { translate } from "../../../HOCs/translate";

class PlayFriendOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: "random",
      incrementOrDelayType: "inc",
      initial: 7,
      incrementOrDelay: 0,
      ratingType: "none"
    };
  }

  componentDidMount() {
    this.updateRating();
  }

  handleChangeColor = e => {
    this.setState({
      color: e.target.value
    });
  };

  handleChangeIncrementOrDelayType = e => {
    this.setState({
      incrementOrDelayType: e.target.value
    });
  };

  handleChange = inputName => {
    return number => {
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
    const { ratingType, incrementOrDelayType, initial, incrementOrDelay } = this.state;

    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    onPlay({
      ratingType,
      color,
      incrementOrDelayType,
      initial,
      incrementOrDelay
    });
  };

  render() {
    const { onClose, translate } = this.props;
    const { initial, incrementOrDelay, incrementOrDelayType, ratingType, color } = this.state;

    const { maxInitialValue, maxIncOrDelayValue } = getMaxInitialAndIncOrDelayTime(
      DynamicRatingsCollection.find().fetch()
    );

    return (
      <div className="play-friend">
        <div className="play-friend__head">
          <h2 className="play-friend__name-title">{translate("createGame")}</h2>
          <Button onClick={onClose}>{translate("BACK")}</Button>
        </div>
        <Form
          className="play-bot__form"
          layout="vertical"
          initialValues={{
            initial,
            incrementOrDelay,
            color: "random"
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
            <div className="play-right-sidebar__inc-deley-wrap">
              <Form.Item
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
          <Button type="primary" onClick={this.handlePlay}>
            {translate("selectOpponent")}
          </Button>
        </Form>
      </div>
    );
  }
}

export default translate("Play.PlayFriendOptions")(PlayFriendOptions);
