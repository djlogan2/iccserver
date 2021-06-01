import React, { Component } from "react";
import { Input, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";

import FallenSoldier from "./FallenSoldier";

import { translate } from "../../HOCs/translate";
import CustomImage from "../components/CustomImage/CustomImage";
import {
  colorBlackUpper,
  colorWhiteLetter,
  colorWhiteUpper,
} from "../../../constants/gameConstants";

class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      edit: false,
      name: props.playerData.name,
    };
  }

  componentDidUpdate(prevProps) {
    const { playerData } = this.props;

    if (playerData?.name !== prevProps?.playerData?.name) {
      this.setState({ name: playerData?.name });
    }
  }

  handleEdit = () => {
    const {
      playerData: { editable },
    } = this.props;

    if (editable) {
      this.setState({ edit: true });
    }
  };

  handleChange = (event) => {
    this.setState({ name: event.target.value });
  };

  getColorByLetter = (letter) => {
    return letter === colorWhiteLetter ? colorWhiteUpper : colorBlackUpper;
  };

  handleUpdate = () => {
    const { gameId, color } = this.props;
    const { name } = this.state;

    Meteor.call("setTag", "set_tag", gameId, this.getColorByLetter(color), name, (err) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({ edit: false });
      }
    });
  };

  render() {
    const {
      cssManager,
      side,
      playerData,
      turnColor,
      message,
      color,
      FallenSoldiers,
      translate,
    } = this.props;
    const { edit, name } = this.state;

    const userPicture = cssManager.userPicture(side * 0.08);
    const tagLine = cssManager.tagLine();

    const { locale } = playerData;
    const flagName = !!locale ? locale.slice(-2) : "us";

    return (
      <div
        style={{
          width: side * 0.8,
          display: "inline-block",
          marginTop: "5px",
          marginBottom: "5px",
          position: "relative",
        }}
      >
        <div style={{ width: side * 0.45, display: "inline-block", position: "relative" }}>
          <img
            style={{ display: "inline-block", float: "left", borderRadius: "5%", ...userPicture }}
            src="images/player-img-top.png"
            alt={translate("userPicture")}
          />
          <div style={{ marginTop: "5px", float: "left", ...tagLine }}>
            <div
              style={{
                display: "inline-block",
                maxWidth: side * 0.25,
                wordBreak: "break-word",
                verticalAlign: "middle",
                marginTop: "5px",
              }}
            >
              {!edit ? (
                <p
                  style={{
                    color: "#fff",
                    fontSize: side * 0.022,
                    fontWeight: "600",
                    marginRight: "15px",
                    display: "block",
                    width: "100%",
                  }}
                  onDoubleClick={this.handleEdit}
                >
                  {name} ({playerData.rating})
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "row", marginRight: "15px" }}>
                  <Input
                    style={{
                      fontSize: side * 0.022,
                      fontWeight: "600",
                      marginRight: "15px",
                      display: "block",
                      flex: 1,
                    }}
                    value={name}
                    onChange={this.handleChange}
                    placeholder="Username"
                  />
                  <Button type="primary" onClick={this.handleUpdate} icon={<CheckOutlined />} />
                </div>
              )}
            </div>
            <div style={{ position: "absolute", bottom: "0", paddingRight: "40px" }}>
              <span
                style={{
                  color: turnColor,
                  fontSize: side * 0.019,
                }}
              >
                {message}
              </span>
            </div>
          </div>
          <CustomImage
            style={{ display: "inline-block", float: "left", borderRadius: "50%", ...userPicture }}
            src={`images/flags/${flagName}.png`}
            supportSrc="images/flags/us.png"
            alt={translate("userPicture")}
          />
        </div>
        <div
          style={{
            width: side * 0.35,
            display: "inline-block",
            verticalAlign: "top",
            marginTop: "5px",
          }}
        >
          <FallenSoldier
            cssManager={cssManager}
            side={side * 0.35}
            color={color}
            soldiers={FallenSoldiers}
          />
        </div>
      </div>
    );
  }
}

export default translate("Common.Player")(Player);
