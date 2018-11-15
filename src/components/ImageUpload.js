import React from 'react';

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

const canvasStyles = {
  display: 'block',
  maxWidth: '380px',
  margin: '10px',
  resize: 'both',
  overflow: 'hidden',
  border: '1px solid grey',
  borderRadius: '6px',
};

export default class ImageUpload extends React.Component {
  static defaultProps = {
    defaultLoadedImage: null,
    onFileLoaded: () => {},
    onNextClicked: () => {},
  };

  state = {
    nextEnabled: false,
  };

  fileInputRef = React.createRef();
  canvasRef = React.createRef();
  loadedImage = null;

  onFileChange = e => {
    const files = e.target.files;
    if (files.length !== 1) {
      alert('Error: Expected exactly 1 file');
      return;
    }
    if (!files[0].type.startsWith('image/')) {
      alert('Error: Expected an image file');
      return;
    }
    const image = files[0];
    const fileReader = new FileReader();
    fileReader.onload = this.onFileLoaded;
    fileReader.readAsDataURL(image);
  };

  componentDidUpdate(prevProps) {
    if (this.props.loadedImage !== prevProps.loadedImage) {
    }
  }

  drawImageToCanvas = () => {
    if (!this.loadedImage) return;
    const { loadedImage, canvasRef } = this;
    const ctx = canvasRef.current.getContext('2d');
    const { height: imgHeight, width: imgWidth } = loadedImage;
    const { height: canvasHeight, width: canvasWidth } = canvasRef.current;

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

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      this.loadedImage,
      xOffset,
      yOffset,
      newImgWidth,
      newImgHeight
    );
  };

  onFileLoaded = e => {
    const img = new Image();
    img.onload = this.drawImageToCanvas;
    this.loadedImage = img;
    img.src = e.target.result;
    this.setState({ nextEnabled: true });
  };

  uploadClicked = () => {
    // We'll use the button click to trigger a click on the hidden file input field
    this.fileInputRef.current.click();
  };

  onNextClick = () => {
    this.props.onNextClicked(this.loadedImage);
  };

  render() {
    return (
      <div>
        <canvas style={canvasStyles} height="300" ref={this.canvasRef} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <button style={{ ...buttonStyles }} onClick={this.uploadClicked}>
            Upload a file
          </button>
          <button
            style={{
              ...buttonStyles,
              display: this.state.nextEnabled ? 'block' : 'none',
            }}
            onClick={this.onNextClick}
          >
            Next
          </button>
        </div>
        <input
          type="file"
          id="imageFile"
          style={{ display: 'none' }}
          ref={this.fileInputRef}
          onChange={this.onFileChange}
        />
        <div style={{ marginTop: '20px' }} />
      </div>
    );
  }
}
