import React from 'react';

export default class Timer extends React.Component {
  static defaultProps = {
    running: false,
  };

  state = {
    timeMins: '00',
    timeSecs: '00',
  };

  intervalTimer = null;
  timeStarted = 0;

  componentDidMount() {
    if (this.props.running) {
      this.startTimer();
    }
  }

  componentWillUnmount() {
    if (this.intervalTimer) {
      this.stopTimer();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.running && !this.props.running) {
      this.stopTimer();
    } else if (!prevProps.running && this.props.running) {
      this.startTimer();
    }
  }

  startTimer = () => {
    this.timeStarted = new Date();
    this.intervalTimer = setInterval(this.tick, 1000);
    this.setState({
      timeMins: '00',
      timeSecs: '00',
    });
  };

  stopTimer = () => {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    this.intervalTimer = null;
  };

  tick = () => {
    const time = new Date() - this.timeStarted;
    const mins = Math.floor(time / 1000 / 60);
    const secs = Math.floor((time - mins * 60 * 1000) / 1000);
    this.setState({
      timeMins: `${mins}`.padStart(2, '0'),
      timeSecs: `${secs}`.padStart(2, '0'),
    });
  };

  render() {
    const { timeMins, timeSecs } = this.state;
    return (
      <div style={{ marginBottom: '20px', fontSize: '32px' }}>
        {timeMins}:{timeSecs}
      </div>
    );
  }
}
