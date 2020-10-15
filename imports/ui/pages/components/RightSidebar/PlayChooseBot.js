import React, { Component } from "react";
import { Button, Form, InputNumber, Radio } from "antd";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/PlayRightSidebar");

export class PlayChooseBot extends Component {
  constructor(props) {
    super(props);
    log.trace("PlayChooseBot constructor", props);
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
      let newState = {};
      let that = this;
      newState[inputName] = number;
      this.setState(newState, () => {
        that.updateRating();
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
    this.setState({ ratingType: ratingType });
  };

  handlePlay = () => {
    let color = this.state.color;
    let ratingType = this.state.ratingType;

    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    this.props.onPlay({
      ratingType: ratingType,
      skillLevel: this.state.difficulty,
      color: color,
      incrementOrDelayType: this.state.incrementOrDelayType,
      initial: this.state.initial,
      incrementOrDelay: this.state.incrementOrDelay
    });
  };

  render() {
    log.trace("PlayChooseBot render", this.props);
    let { onClose } = this.props;
    return (
      <div className="play-friend">
        <div className="play-friend__head">
          <h2 className="play-friend__name-title">Play with computer</h2>
          <Button onClick={onClose}>Back</Button>
        </div>
        <Form
          className="play-bot__form"
          layout="vertical"
          initialValues={{
            initial: this.state.initial,
            incrementOrDelay: this.state.incrementOrDelay
          }}
        >
          <Form.Item label="Difficulty" name="difficulty">
            <Radio.Group
              onChange={this.handleChangeDifficulty}
              defaultValue={this.state.difficulty}
              value={this.state.difficulty}
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
          <Form.Item label="Color" name="color">
            {/* ["none", "us", "bronstein", "inc"] */}
            <Radio.Group
              onChange={this.handleChangeColor}
              defaultValue={this.state.color}
              value={this.state.color}
            >
              <Radio.Button value={"random"}>Random</Radio.Button>
              <Radio.Button value={"white"}>White</Radio.Button>
              <Radio.Button value={"black"}>Black</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Time control" name="time-control">
            <Radio.Group
              onChange={this.handleChangeIncrementOrDelayType}
              defaultValue={this.state.incrementOrDelayType}
              value={this.state.incrementOrDelayType}
            >
              <Radio.Button value={"inc"}>inc</Radio.Button>
              <Radio.Button value={"none"}>none</Radio.Button>
              <Radio.Button value={"us"}>us</Radio.Button>
              <Radio.Button value={"bronstein"}>bronstein</Radio.Button>
            </Radio.Group>
            <div className="play-right-sidebar__inc-deley-wrap">
              <Form.Item label="Initial" name="initial">
                <InputNumber
                  min={0}
                  disabled={this.state.incrementOrDelayType === "none"}
                  value={this.state.initial}
                  onChange={this.handleChange("initial")}
                />
              </Form.Item>
              <Form.Item label="Increment or delay" name="incrementOrDelay">
                <InputNumber
                  min={0}
                  disabled={this.state.incrementOrDelayType === "none"}
                  value={this.state.incrementOrDelay}
                  onChange={this.handleChange("incrementOrDelay")}
                />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label="rating type" name="ratingType">
            <p>{this.state.ratingType}</p>
          </Form.Item>
          <Button type="primary" onClick={this.handlePlay}>
            Start the game
          </Button>
        </Form>
      </div>
    );
  }
}
