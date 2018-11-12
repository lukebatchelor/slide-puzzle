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
};

export default class ImageUpload extends React.Component {
  static defaultProps = {
    canvasRef: null,
    loadedImage: null,
    onFileLoaded: () => {},
  };
  fileInputRef = React.createRef();

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
    fileReader.onload = this.props.onFileLoaded;
    fileReader.readAsDataURL(image);
  };

  componentDidUpdate(prevProps) {
    if (this.props.loadedImage !== prevProps.loadedImage) {
      const { loadedImage, canvasRef } = this.props;
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
        this.props.loadedImage,
        xOffset,
        yOffset,
        newImgWidth,
        newImgHeight
      );
    }
  }

  uploadClicked = () => {
    // We'll use the button click to trigger a click on the hidden file input field
    this.fileInputRef.current.click();
  };

  render() {
    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'inline-block',
        }}
      >
        <button
          style={{ ...buttonStyles, margin: '0 10px' }}
          onClick={this.uploadClicked}
        >
          Upload a file
        </button>
        <input
          type="file"
          id="imageFile"
          style={{ display: 'none' }}
          ref={this.fileInputRef}
          onChange={this.onFileChange}
        />
      </div>
    );
  }
}
