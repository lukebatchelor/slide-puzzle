import React from 'react';

// Return an array of indexes of pieces that can legally be moved
// We will know which piece can be moved by looking at the pieces order, finding
// where the null is (the gap piece) and looking for which indexes would neighbour
// it
function getLegalMoves(piecesOrder) {
  const nullIndex = piecesOrder.indexOf(null);
  const puzzleSize = Math.sqrt(piecesOrder.length);
  const { x, y } = indexToXandY(nullIndex, puzzleSize);
  const neighbours = [];

  if (x - 1 >= 0) {
    neighbours.push({ x: x - 1, y });
  }
  if (y - 1 >= 0) {
    neighbours.push({ x, y: y - 1 });
  }
  if (x + 1 < puzzleSize) {
    neighbours.push({ x: x + 1, y });
  }
  if (y + 1 < puzzleSize) {
    neighbours.push({ x, y: y + 1 });
  }

  // now return neighbours as a list of indexes
  return neighbours.map(({ x, y }) => xAndYToIndex(x, y, puzzleSize));
}

// Returns the x and y coordinate of where an index would line up in a grid
// i.e in a 3x3, index 1 (the second piece) would return {x: 1, y: 0}
function indexToXandY(index, puzzleSize) {
  const x = index % puzzleSize;
  const y = Math.floor(index / puzzleSize);

  return { x, y };
}

function xAndYToIndex(x, y, puzzleSize) {
  return y * puzzleSize + x;
}

// shuffling is achieved by continuously checking which moves are legal and
// choosing one at random
function shufflePieces(piecesOrder) {
  const piecesCopy = Array.from(piecesOrder);

  // Keep track of the last move so we don't undo it immediately
  let lastMove = 0;
  for (let i = 0; i < 20; i++) {
    const nullIndex = piecesCopy.indexOf(null);
    const legalMoves = getLegalMoves(piecesCopy).filter(m => m !== lastMove); // never undo the last move we just made
    const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    const oldPieceNumber = piecesCopy[move];
    piecesCopy[move] = null;
    piecesCopy[nullIndex] = oldPieceNumber;
    lastMove = move;
  }

  return piecesCopy;
}

function clickPosToPieceIdx(
  clickX,
  clickY,
  canvasWidth,
  canvasHeight,
  puzzleSize
) {
  const clickXCoord = Math.floor(clickX / (canvasWidth / puzzleSize)); // grid x coord of click
  const clickYCoord = Math.floor(clickY / (canvasHeight / puzzleSize)); // grid y coord of click
  const idx = xAndYToIndex(clickXCoord, clickYCoord, puzzleSize);

  return idx;
}

export default class Puzzle extends React.Component {
  static defaultProps = {
    canvasRef: null,
    resizedImageData: null,
    puzzleSize: 3,
  };

  // array of image data of all pieces in correct order, t->b l->r
  allPiecesImageData = [];
  // Array of indexes of where each piece currently sits t->b, l->r
  curPiecesOrder = [];

  componentDidMount() {
    const canvas = this.props.canvasRef.current;
    const puzzleSize = this.props.puzzleSize;

    this.allPiecesImageData = this.getPiecesImageData();
    const piecesOrder = [];
    for (let i = 0; i < puzzleSize * puzzleSize - 1; i++) {
      piecesOrder.push(i);
    }
    piecesOrder.push(null);
    const newOrder = shufflePieces(piecesOrder);
    this.curPiecesOrder = newOrder;
    this.updateCanvas();

    canvas.addEventListener('click', this.onClick);
  }

  componentWillUnmount() {
    const canvas = this.props.canvasRef.current;
    canvas.removeEventListener('click', this.startDrag);
  }

  updateCanvas = () => {
    if (!this.props.canvasRef || !this.allPiecesImageData.length) return;
    const { canvasRef, puzzleSize } = this.props;
    const { allPiecesImageData, curPiecesOrder } = this;
    const ctx = canvasRef.current.getContext('2d');
    const { height: canvasHeight, width: canvasWidth } = canvasRef.current;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < curPiecesOrder.length; i++) {
      const pieceNumber = curPiecesOrder[i];
      if (pieceNumber == null) continue;
      const pieceImageData = allPiecesImageData[pieceNumber];
      const { x, y } = indexToXandY(i, puzzleSize);
      const xOffset = x * (canvasWidth / puzzleSize);
      const yOffset = y * (canvasHeight / puzzleSize);
      ctx.putImageData(pieceImageData, xOffset, yOffset);
    }

    this.drawGrid(ctx, canvasHeight, canvasWidth);
  };

  drawGrid = (ctx, canvasHeight, canvasWidth) => {
    const puzzleSize = this.props.puzzleSize;

    ctx.strokeStyle = '#ff0000';
    // We'll go from 0 to n + 1 so that we have surrounding lines too
    for (let i = 0; i < puzzleSize + 1; i++) {
      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(0, (canvasHeight / puzzleSize) * i);
      ctx.lineTo(canvasWidth, (canvasHeight / puzzleSize) * i);
      ctx.stroke();
      // Draw Vertical Line
      ctx.beginPath();
      ctx.moveTo((canvasWidth / puzzleSize) * i, 0);
      ctx.lineTo((canvasWidth / puzzleSize) * i, canvasHeight);
      ctx.stroke();
    }
  };

  getPiecesImageData = () => {
    if (!this.props.canvasRef) return;
    const { resizedImageData, canvasRef, puzzleSize } = this.props;
    const ctx = canvasRef.current.getContext('2d');
    const { height: canvasHeight, width: canvasWidth } = canvasRef.current;
    const pieceHeight = canvasHeight / puzzleSize;
    const pieceWidth = canvasWidth / puzzleSize;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // First we'll draw the image to the screen
    ctx.putImageData(resizedImageData, 0, 0);

    // Then we'll get each piece out
    const piecesImageData = [];
    for (let y = 0; y < puzzleSize; y++) {
      for (let x = 0; x < puzzleSize; x++) {
        const pieceImageData = ctx.getImageData(
          x * pieceWidth,
          y * pieceHeight,
          pieceWidth,
          pieceHeight
        );
        piecesImageData.push(pieceImageData);
      }
    }

    return piecesImageData;
  };

  onClick = e => {
    const { canvasRef, puzzleSize } = this.props;
    const { height: canvasHeight, width: canvasWidth } = canvasRef.current;
    const { curPiecesOrder } = this;
    const pieceIdx = clickPosToPieceIdx(
      e.offsetX,
      e.offsetY,
      canvasWidth,
      canvasHeight,
      puzzleSize
    );
    const legalMoves = getLegalMoves(curPiecesOrder);

    // If the move was legal, then swap the piece in the selected index with the
    // empty piece
    if (legalMoves.indexOf(pieceIdx) !== -1) {
      const oldValue = curPiecesOrder[pieceIdx];
      const nullIdx = curPiecesOrder.indexOf(null);
      curPiecesOrder[pieceIdx] = null;
      curPiecesOrder[nullIdx] = oldValue;
      this.updateCanvas();
    }
  };

  render() {
    return <></>;
  }
}
