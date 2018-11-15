import React from 'react';

import ImageUpload from './ImageUpload';
import ImageResize from './ImageResize';
import Puzzle from './Puzzle';

const buttonStyles = enabled => ({
  border: '2px solid gray',
  color: 'gray',
  backgroundColor: 'white',
  padding: '8px 10px',
  borderRadius: '8px',
  fontSize: '20px',
  fontWeight: 'bold',
  outline: 'none',
  userSelect: 'none',
  visibility: enabled ? 'visible' : 'hidden',
});

const canvasStyles = curState => ({
  maxWidth: '380px',
  margin: '10px',
  resize: 'both',
  overflow: 'hidden',
  border: curState !== 'IMAGE_SAVING' ? '1px solid grey' : 0,
  borderRadius: curState !== 'IMAGE_SAVING' ? '6px' : 0,
});

export default class App extends React.Component {
  state = {
    resizedImageData: null,
    curState: 'IMAGE_UPLOAD',
  };
  canvasRef = React.createRef();
  // values from the resizing and centering step
  loadedImage = null;
  xOffset = 0;
  yOffset = 0;
  zoomLevel = 1;

  onBackClick = e => {
    if (this.state.curState === 'IMAGE_RESIZE') {
      this.setState({
        curState: 'IMAGE_UPLOAD',
      });
    }
    if (this.state.curState === 'PUZZLE') {
      this.setState({
        curState: 'IMAGE_RESIZE',
      });
    }
  };

  onNextClick = e => {
    if (this.state.curState === 'IMAGE_UPLOAD') {
      this.setState({ curState: 'IMAGE_RESIZE', backEnabled: true });
    }
    if (this.state.curState === 'IMAGE_RESIZE') {
      const canvas = this.canvasRef.current;
      const ctx = canvas.getContext('2d');
      const { height: imgHeight, width: imgWidth } = this.loadedImage;
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
      this.setState({
        curState: 'PUZZLE',
        resizedImageData,
        backEnabled: false,
        nextEnabled: false,
      });
    }
  };

  onImageUploaded = img => {
    this.loadedImage = img;
    this.setState({
      curState: 'IMAGE_RESIZE',
    });
  };

  onZoomUpdated = newZoom => {
    this.zoomLevel = newZoom;
  };

  onOffsetUpdated = ({ xOffset, yOffset }) => {
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  };

  render() {
    return (
      <>
        {this.state.curState === 'IMAGE_UPLOAD' && (
          <p>To begin, upload an image!</p>
        )}
        {this.state.curState === 'IMAGE_RESIZE' && (
          <p>Now resize and center the face!</p>
        )}
        {this.state.curState === 'PUZZLE' && (
          <p>Click the pieces to move them around</p>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            padding: '10px',
            height: '70px',
          }}
        >
          {this.state.curState === 'IMAGE_UPLOAD' && (
            <ImageUpload
              canvasRef={this.canvasRef}
              onNextClicked={this.onImageUploaded}
              defaultLoadedImage={this.loadedImage}
            />
          )}
          {this.state.curState === 'IMAGE_RESIZE' && (
            <ImageResize
              canvasRef={this.canvasRef}
              loadedImage={this.loadedImage}
              onZoomUpdated={this.onZoomUpdated}
              onOffsetUpdated={this.onOffsetUpdated}
            />
          )}
          {this.state.curState === 'PUZZLE' && (
            <Puzzle
              canvasRef={this.canvasRef}
              resizedImageData={this.state.resizedImageData}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '300px',
          }}
        >
          <button
            style={buttonStyles(this.state.backEnabled)}
            disabled={!this.state.backEnabled}
            onClick={this.onBackClick}
          >
            Back
          </button>
          <button
            style={buttonStyles(this.state.nextEnabled)}
            disabled={!this.state.nextEnabled}
            onClick={this.onNextClick}
          >
            Next
          </button>
        </div>
      </>
    );
  }
}
