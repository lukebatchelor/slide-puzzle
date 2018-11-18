import React from 'react';

const canvasStyles = {
  display: 'block',
  maxWidth: '380px',
  margin: '10px',
  resize: 'both',
  overflow: 'hidden',
  border: '1px solid grey',
  borderRadius: '6px',
};

const buttonStyles = {
  border: '2px solid gray',
  color: 'gray',
  backgroundColor: 'white',
  padding: '8px 10px',
  borderRadius: '8px',
  fontSize: '20px',
  fontWeight: 'bold',
  outline: 'none',
  userSelect: 'none',
  margin: '10px',
};

function getDefaultOffsetsAndZoomLevel({
  imgHeight,
  imgWidth,
  canvasHeight,
  canvasWidth,
}) {
  // If the image is too big, we'll scale it and center it
  const xScaling = imgWidth > canvasWidth ? canvasWidth / imgWidth : 1;
  const yScaling = imgHeight > canvasHeight ? canvasHeight / imgHeight : 1;
  // We want to scale both dimensions evenly, so take the biggest scaling factor
  const maxScaling = Math.min(xScaling, yScaling);
  const newImgWidth = imgWidth * maxScaling;
  const newImgHeight = imgHeight * maxScaling;

  // Now center it using the new sizes
  const xOffset = (canvasWidth - newImgWidth) / 2;
  const yOffset = (canvasHeight - newImgHeight) / 2;

  return {
    xOffset,
    yOffset,
    zoomLevel: maxScaling,
  };
}

export default class ImageResize extends React.Component {
  static defaultProps = {
    loadedImage: null,
    onZoomUpdated: () => {},
    onOffsetUpdated: () => {},
    onNextClick: () => {},
    onBackClick: () => {},
  };

  // We stare these as instance properties rather than on state because we
  // don't need React to re-render at all, all redering is done by us on the canvas
  canvasRef = React.createRef();
  isDragging = false;
  imgXOffset = 0;
  imgYOffset = 0;
  zoomLevel = 1;
  dragX = 0;
  dragY = 0;

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const { height: imgHeight, width: imgWidth } = this.props.loadedImage;
    const { height: canvasHeight, width: canvasWidth } = canvas;
    const { xOffset, yOffset, zoomLevel } = getDefaultOffsetsAndZoomLevel({
      imgHeight,
      imgWidth,
      canvasHeight,
      canvasWidth,
    });
    this.imgXOffset = xOffset;
    this.imgYOffset = yOffset;
    this.zoomLevel = zoomLevel;
    this.props.onZoomUpdated(zoomLevel);
    this.props.onOffsetUpdated({ xOffset, yOffset });
    this.updateCanvas();
    // Need to force an update to get the default zoomLevel set on the slider
    this.forceUpdate();

    canvas.addEventListener('mousedown', this.startDrag);
    canvas.addEventListener('mousemove', this.updateDrag);
    canvas.addEventListener('mouseup', this.endDrag);
    canvas.addEventListener('mouseleave', this.endDrag);
    canvas.addEventListener('touchstart', this.startDrag);
    canvas.addEventListener('touchend', this.endDrag);
    canvas.addEventListener('touchmove', this.updateDrag);
  }

  componentWillUnmount() {
    const canvas = this.canvasRef.current;
    canvas.removeEventListener('mousedown', this.startDrag);
    canvas.removeEventListener('mousemove', this.updateDrag);
    canvas.removeEventListener('mouseup', this.endDrag);
    canvas.removeEventListener('mouseleave', this.endDrag);
    canvas.removeEventListener('touchstart', this.startDrag);
    canvas.removeEventListener('touchend', this.endDrag);
    canvas.removeEventListener('touchmove', this.updateDrag);
  }

  updateCanvas = () => {
    if (!this.canvasRef) return;
    const { loadedImage } = this.props;
    const { canvasRef } = this;
    const ctx = canvasRef.current.getContext('2d');
    const { height: imgHeight, width: imgWidth } = loadedImage;
    const { height: canvasHeight, width: canvasWidth } = canvasRef.current;
    const newImgHeight = imgHeight * this.zoomLevel;
    const newImgWidth = imgWidth * this.zoomLevel;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.drawImage(
      this.props.loadedImage,
      this.imgXOffset,
      this.imgYOffset,
      newImgWidth,
      newImgHeight
    );
  };

  startDrag = e => {
    this.isDragging = true;

    if (e.touches) {
      this.dragX = e.touches[0].clientX;
      this.dragY = e.touches[0].clientY;
    } else {
      this.dragX = e.offsetX;
      this.dragY = e.offsetY;
    }
  };

  updateDrag = e => {
    if (this.isDragging) {
      let newX = e.offsetX;
      let newY = e.offsetY;
      if (e.touches) {
        newX = e.touches[0].clientX;
        newY = e.touches[0].clientY;
      }

      this.imgXOffset -= this.dragX - newX;
      this.imgYOffset -= this.dragY - newY;
      this.dragX = newX;
      this.dragY = newY;
      this.props.onOffsetUpdated({
        xOffset: this.imgXOffset,
        yOffset: this.imgYOffset,
      });
      this.updateCanvas();
    }
  };

  endDrag = e => {
    this.isDragging = false;
  };

  onZoomChange = e => {
    const newValue = e.target.value;
    const zoomLevelDiff = this.zoomLevel - newValue;
    this.zoomLevel = newValue;
    const { height: imgHeight, width: imgWidth } = this.props.loadedImage;
    this.imgXOffset += (imgWidth / 2) * zoomLevelDiff;
    this.imgYOffset += (imgHeight / 2) * zoomLevelDiff;
    this.props.onOffsetUpdated({
      xOffset: this.imgXOffset,
      yOffset: this.imgYOffset,
    });
    this.props.onZoomUpdated(newValue);
    this.updateCanvas();
  };

  finaliseResize = () => {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { height: imgHeight, width: imgWidth } = this.props.loadedImage;
    const { height: canvasHeight, width: canvasWidth } = canvas;
    const newImgHeight = imgHeight * this.zoomLevel;
    const newImgWidth = imgWidth * this.zoomLevel;

    // Now we only want to get the image data for the parts of the image that
    // are visible in the canvas, so we clamp our values to those edges
    const resizedImageData = ctx.getImageData(
      Math.max(this.xOffset, 0),
      Math.max(this.yOffset, 0),
      Math.min(newImgWidth, canvasWidth),
      Math.min(newImgHeight, canvasHeight)
    );

    this.props.onImageResized(resizedImageData);
  };

  render() {
    return (
      <div>
        <p>Now resize and center the face!</p>
        <canvas style={canvasStyles} height="300" ref={this.canvasRef} />
        <input
          type="range"
          onChange={this.onZoomChange}
          min="0"
          max="1"
          defaultValue={this.zoomLevel}
          step="0.01"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button style={buttonStyles} onClick={this.props.onBackClick}>
            Back
          </button>
          <button style={buttonStyles} onClick={this.finaliseResize}>
            Next
          </button>
        </div>
      </div>
    );
  }
}
