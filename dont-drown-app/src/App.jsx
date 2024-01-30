import { useState, useEffect, StrictMode } from 'react';
import './App.css';
import Sketch from './Sketch';
import { LOADING } from './p5_modules/constants';
import Menu from './Menu';

const MARGIN_DIV = 10;

function App() {
  // p5Prop is used to detect duplicate canvases
  const [p5Prop, setP5Prop] = useState(false);
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  const [marginX, setMarginX] = useState(0);
  const [lineGap, setLineGap] = useState(0);
  const [topLineGap, setTopLineGap] = useState(0);
  const [gameState, setGameState] = useState(LOADING);

  useEffect(() => {
    console.log(`gameState changed: ${gameState}`);
  }, [gameState])

  useEffect(() => {
    console.log(`canvasDims: {${Object.entries(canvasDims)}}`)
  }, [canvasDims])

  useEffect(() => {
    console.log(`topLineGap: ${topLineGap}`)
  }, [topLineGap])

  function setCanvasDimsWrapper(dims) {
    setCanvasDims(dims);
    setMarginX(dims.width / MARGIN_DIV);
  }

  return (
    <StrictMode>
      <>
        <Sketch
          p5Prop={p5Prop}
          setP5Prop={setP5Prop}
          gameState={gameState}
          setGameState={setGameState}
          setCanvasDims={setCanvasDimsWrapper}
          marginX={marginX}
          lineGap={lineGap}
          topLineGap={topLineGap}
        />
        <Menu
          gameState={gameState}
          canvasDims={canvasDims}
          marginX={marginX}
          lineGap={lineGap}
          setLineGap={setLineGap}
          topLineGap={topLineGap}
          setTopLineGap={setTopLineGap}
        />
      </>
    </StrictMode>
  )
}

export default App
