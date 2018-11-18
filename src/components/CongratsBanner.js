import React from 'react';

const colors = [
  '#A800FF', // Vivid Violet
  '#0079FF', // Azure,
  '#00F11D', // Electric Green
  '#FFEF00', // Canary Yellow
  '#FF7F00', // Orange (Color Wheel)
  '#FF0900', //Canady Apple Red
];

export default class CongratsBanner extends React.Component {
  headerRef = React.createRef();
  intervalTimer = null;
  colorOffset = 0;

  componentDidMount() {
    this.intervalTimer = setInterval(this.tick, 50);
  }

  componentWillUnmount() {
    clearInterval(this.intervalTimer);
    this.intervalTimer = null;
  }

  tick = () => {
    const header = this.headerRef.current;
    const letters = header.querySelectorAll('span');

    let colIdx = this.colorOffset;
    for (let letter of letters) {
      letter.style.color = colors[colIdx];
      colIdx = (colIdx + 1) % colors.length;
    }

    this.colorOffset = (this.colorOffset + 1) % colors.length;
  };

  render() {
    return (
      <h1 ref={this.headerRef}>
        <span>C</span>
        <span>o</span>
        <span>n</span>
        <span>g</span>
        <span>r</span>
        <span>a</span>
        <span>t</span>
        <span>u</span>
        <span>l</span>
        <span>a</span>
        <span>t</span>
        <span>i</span>
        <span>o</span>
        <span>n</span>
        <span>s</span>
        <span>!</span>
      </h1>
    );
  }
}
