import React from 'react';

import ImageUpload from './ImageUpload';
import ImageResize from './ImageResize';
import Puzzle from './Puzzle';

export default class App extends React.Component {
  state = {
    curState: 'IMAGE_UPLOAD',
  };

  canvasRef = React.createRef();
  // values from the resizing and centering step
  loadedImage = null;
  resizedImageData = null;

  onImageUploaded = img => {
    this.loadedImage = img;
    this.setState({
      curState: 'IMAGE_RESIZE',
    });
  };

  onImageResized = resizedImageData => {
    this.resizedImageData = resizedImageData;

    this.setState({
      curState: 'PUZZLE',
    });
  };

  showUploadScreen = () => {
    this.setState({
      curState: 'IMAGE_UPLOAD',
    });
  };

  render() {
    return (
      <>
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
              onNextClicked={this.onImageUploaded}
              defaultLoadedImage={this.loadedImage}
            />
          )}
          {this.state.curState === 'IMAGE_RESIZE' && (
            <ImageResize
              loadedImage={this.loadedImage}
              onImageResized={this.onImageResized}
              onBackClick={this.showUploadScreen}
            />
          )}
          {this.state.curState === 'PUZZLE' && (
            <Puzzle
              canvasRef={this.canvasRef}
              resizedImageData={this.resizedImageData}
            />
          )}
        </div>
      </>
    );
  }
}
