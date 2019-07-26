import React, { Component } from 'react'
const TOTAL_MINUTES = 60;
export default class ClockComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: props.time,
        };
    }


    componentDidMount() {
        this.intervalId = setInterval(
            () => {
                const { time } = this.state;
                const playDong = time === 59;
                if (time > 0) {
                    this.setState({
                        time: time - 1,
                    });
                }

            },
            1000,
        );


    }
    componentWillUnMount() {
        clearInterval(this.intervalId);
    }

    render() {
        //	let propsTime = this.props.gameClockInfo;
        //	let blackPlayerTime = this.gametimeUpdate(propsTime);
        //const { enabled } = this.props;
        const { time } = this.state;

        let minutes = '' +
            Math.floor(time % (TOTAL_MINUTES * TOTAL_MINUTES) / TOTAL_MINUTES);
        let seconds = '' + Math.floor(time % TOTAL_MINUTES);

        if (isNaN(minutes) || isNaN(seconds)) {
            return null;
        }

        if (minutes.length === 1) {
            minutes = `0${minutes}`;
        }
        if (seconds.length === 1) {
            seconds = `0${seconds}`;
        }

        return (
          <div style={this.props.CssManager.clock()}>
            {minutes}:{seconds}
          </div>
        );
    }
}