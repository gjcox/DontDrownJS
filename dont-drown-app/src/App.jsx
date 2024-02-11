import { StrictMode, useEffect, useState } from 'react';

import './App.css';
import Menu from './Menu';
import Sketch from './Sketch';
import { H1_FONT, LOADING, MEDIUM_FONT, TOP_LINE_MULT, MARGIN_DIV } from './utils/constants';

function App() {
  // Scaling/rendering values 
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  const [marginX, setMarginX] = useState(0);
  const [fontSize, setFontSize] = useState(MEDIUM_FONT);
  const [topLineGap, setTopLineGap] = useState(MEDIUM_FONT * H1_FONT * TOP_LINE_MULT);

  function setCanvasDimsWrapper(dims) {
    setCanvasDims(dims);
    setMarginX(dims.width / MARGIN_DIV);
  }

  useEffect(() => {
    setTopLineGap(fontSize * H1_FONT * TOP_LINE_MULT);
  }, [fontSize]);

  useEffect(() => {
    console.log(`canvasDims: {${Object.entries(canvasDims)}}`)
  }, [canvasDims]);

  useEffect(() => {
    console.log(`topLineGap: ${topLineGap}`)
  }, [topLineGap]);

  // Game state 
  const [gameState, setGameState] = useState(LOADING);
  const [getLevels, setGetLevels] = useState(() => { () => console.warn("getLevels undefined") });
  const [startLevel, setStartLevel] = useState(() => { () => console.warn("startLevel undefined") });

  useEffect(() => {
    console.log(`gameState: ${gameState}`);
  }, [gameState]);

  useEffect(() => {
    if (typeof getLevels === 'function') {
      console.log(`levels: ${getLevels().length}`);
    } else {
      console.warn(`getLevels is not a function: ${getLevels}`);
    }
  }, [getLevels]);

  useEffect(() => {
    if (typeof startLevel !== 'function') {
      console.warn(`startLevel is not a function: ${startLevel}`);
    }
  }, [startLevel]);


  return (
    <StrictMode>
      <>
        <Sketch
          gameState={gameState}
          setGameState={setGameState}
          setCanvasDims={setCanvasDimsWrapper}
          marginX={marginX}
          lineGap={fontSize}
          topLineGap={topLineGap}
          setGetLevels={setGetLevels}
          setStartLevel={setStartLevel}
        />
        <Menu
          gameState={gameState}
          canvasDims={canvasDims}
          marginX={marginX}
          lineGap={fontSize}
          setLineGap={setFontSize}
          topLineGap={topLineGap}
          getLevels={getLevels}
          startLevel={startLevel}
        />
      </>
    </StrictMode>
  )
}

export default App
