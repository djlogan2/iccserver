import React, { Component } from "react";
import PropTypes from "prop-types";

export default class ExamineComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      userId: null,
      wild_number: 0,
      rating_type: "standard",
      rated: true,
      is_adjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    };
  }

  removeUser() {
    this.setState({
      user: null,
      wild_number: 0,
      rating_type: "standard",
      rated: false,
      is_adjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    });
  }
  handelUserClick = (user, Id) => {
    this.setState({ user: user.username, userId: Id });
  };
  handleChangeMinute = minute => {
    this.setState({ time: minute });
  };
  handleChangeSecond = inc => {
    this.setState({ inc: inc });
  };
  handleChangeGameType = type => {
    this.setState({ rating_type: type });
  };
  handleIncOrDelayTypeChange = incOrDelay => {
    this.setState({ incOrdelayType: incOrDelay });
  };
  handleChangeColor = color => {
    this.setState({ color: color });
  };
  handleRatedChange = rate => {
    this.setState({ rated: rate });
  };

  handleMatchSubmit() {
    this.setState({
      userId: null,
      user: null,
      wild_number: 0,
      rating_type: "standard",
      rated: false,
      is_adjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    });
  }

  toggleHover() {
    this.setState({ hover: !this.state.hover });
  }

  render() {
    const userdata2 = ["User-1", "User-2", "User-3", "User-4"];
    const userdata = ["Joi", "Mac", "Smith", "Mannu"];
    return (
      <div>
        <div style={this.props.cssManager.tabSeparator()} />
        <div style={this.props.cssManager.matchUserScroll()}>
          <SubTabs cssManager={this.props.cssManager}>
            <div label="Observer">
              <div style={this.props.cssManager.subTabHeader()}>
                {userdata2.map((user, index) => (
                  <div key={index} className="userlist">
                    <button
                      onClick={this.handelUserClick.bind(this, user)}
                      style={this.props.cssManager.matchUserButton()}
                    >
                      {user}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div label="Examiner">
              <div style={this.props.cssManager.subTabHeader()}>
                {userdata.map((user, index) => (
                  <div key={index} className="userlist">
                    <button
                      onClick={this.handelUserClick.bind(this, user)}
                      style={this.props.cssManager.matchUserButton()}
                    >
                      {user}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SubTabs>
        </div>
      </div>
    );
  }
}

class SubTabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
    cssManager: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      activeTab: this.props.children[0].props.label
    };
  }

  onClickTabItem = tab => {
    this.setState({ activeTab: tab });
  };

  render() {
    const {
      onClickTabItem,
      props: { children },
      state: { activeTab }
    } = this;

    return (
      <div className="tab">
        <ol className="tab-list">
          {children.map(child => {
            const { label } = child.props;

            return (
              <Tab
                activeTab={activeTab}
                key={label}
                label={label}
                onClick={onClickTabItem}
                cssManager={this.props.cssManager}
              />
            );
          })}
        </ol>
        <div className="tab-content">
          {children.map(child => {
            if (child.props.label !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
      </div>
    );
  }
}

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };

  render() {
    const {
      onClick,
      props: { activeTab, label }
    } = this;
    //TODO : Now we have working on.we will remove soon
    let tablistItem = {
      display: "inline-block",
      listStyle: "none",
      marginBottom: "-1px",
      padding: "1rem 1.75rem",
      borderRadius: "0px 30px 0px 0px",
      border: "#ccc 1px solid",
      cursor: "pointer"
    };

    if (activeTab === label)
      tablistItem = {
        background: "#1565c0",
        color: "white",
        display: "inline-block",
        listStyle: "none",
        marginBottom: "-1px",
        padding: "1rem 1.75rem",
        border: "#ccc 0px solid",
        borderRadius: "0px 20px 0px 0px",
        cursor: "pointer"
      };

    return (
      <li style={tablistItem} onClick={onClick}>
        {label}
      </li>
    );
  }
}
