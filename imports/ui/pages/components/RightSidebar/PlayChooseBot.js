import React, { Component } from "react";
import { Button, Form, InputNumber, Radio } from "antd";
import { translate } from "../../../HOCs/translate";

class PlayChooseBot extends Component {
  constructor(props) {
    super(props);

    this.state = {
      difficulty: 5,
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

  handleChangeDifficulty = e => {
    this.setState({
      difficulty: e.target.value
    });
  };

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
    let { initial, incrementOrDelay } = this.state;
    let index = initial + (2 / 3) * incrementOrDelay;

    const ratingConfig = {
      bullet: [0, 2],
      blitz: [3, 14],
      standard: [15, 600]
    };

    let ratingType = "none";

    if (ratingConfig.bullet[0] <= index && index <= ratingConfig.bullet[1]) {
      ratingType = "bullet";
    } else if (ratingConfig.blitz[0] <= index && index <= ratingConfig.blitz[1]) {
      ratingType = "blitz";
    } else if (ratingConfig.standard[0] <= index && index <= ratingConfig.standard[1]) {
      ratingType = "standard";
    }

    this.setState({ ratingType });
  };

  handlePlay = () => {
    const { onPlay } = this.props;

    let { color } = this.state;
    const { ratingType, difficulty, incrementOrDelayType, initial, incrementOrDelay } = this.state;

    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }

    onPlay({
      ratingType,
      color,
      incrementOrDelayType,
      initial,
      incrementOrDelay,
      skillLevel: difficulty
    });
  };

  render() {
    const { onClose, translate } = this.props;
    const {
      initial,
      incrementOrDelay,
      difficulty,
      incrementOrDelayType,
      color,
      ratingType
    } = this.state;

    return (
      <div className="play-friend">
        <div className="play-friend__head">
          <h2 className="play-friend__name-title">{translate("playWithComputer")}</h2>
          <div>
            <Button type="primary" style={{ marginRight: "5px" }} onClick={this.handlePlay}>
              {translate("startTheGame")}
            </Button>
            <Button onClick={onClose}>{translate("back")}</Button>
          </div>
        </div>
        <Form
          className="play-bot__form"
          layout="vertical"
          initialValues={{
            initial,
            incrementOrDelay
          }}
        >
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
          <Form.Item label={translate("timeControl")} name="time-control">
            <Radio.Group
              name="timeControl"
              onChange={this.handleChangeIncrementOrDelayType}
              defaultValue={incrementOrDelayType}
              value={incrementOrDelayType}
            >
              <Radio.Button value="inc">{translate("control.inc")}</Radio.Button>
              <Radio.Button value="none">{translate("control.none")}</Radio.Button>
              <Radio.Button value="us">{translate("control.us")}</Radio.Button>
              <Radio.Button value="bronstein">{translate("control.bronstein")}</Radio.Button>
            </Radio.Group>
            <div className="play-right-sidebar__inc-deley-wrap">
              <Form.Item label={translate("initial")} name="initial">
                <InputNumber
                  name="initial"
                  min={0}
                  disabled={incrementOrDelayType === "none"}
                  value={initial}
                  onChange={this.handleChange("initial")}
                />
              </Form.Item>
              <Form.Item label={translate("incrementOrDelay")} name="incrementOrDelay">
                <InputNumber
                  name="incrementOrDelay"
                  min={0}
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
        </Form>
      </div>
    );
  }
}

export default translate("Play.PlayChooseBot")(PlayChooseBot);
