import React from "react";

export const withSounds = (component) => (WrappedComponent) => {
  return class extends React.Component {
    playSound = (soundName) => {
      const testAudio = new Audio("asset/" + Meteor.userId() + "/board.piecemove");
      testAudio.play();

      return;

      const audio = new Audio(`${component}/${soundName}`);
      audio.play();
    };

    render() {
      return <WrappedComponent {...this.props} playSound={this.playSound} />;
    }
  };
};
