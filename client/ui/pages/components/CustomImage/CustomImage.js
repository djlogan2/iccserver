import React from "react";

class CustomImage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      src: props.src,
    };
  }

  handleError = () => {
    const { supportSrc } = this.props;

    this.setState({ src: supportSrc });
  };

  render() {
    const { supportSrc, ...rest } = this.props;
    const { src } = this.state;

    return <img onError={this.handleError} src={src} {...rest} />;
  }
}

export default CustomImage;
