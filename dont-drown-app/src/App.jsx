import { useState, useEffect, StrictMode } from 'react';
import './App.css';
import Sketch from './Sketch';
import { MAIN_MENU as IN_MENU, LOADING } from './p5_modules/constants';

const MARGIN_DIV = 10;


function App() {
  // p5Prop is used to detect duplicate canvases
  const [p5Prop, setP5Prop] = useState(false);
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  const [marginX, setMarginX] = useState(0);
  const [gameState, setGameState] = useState(LOADING);

  useEffect(() => {
    console.log(`gameState changed: ${gameState}`);
  }, [gameState])

  useEffect(() => {
    console.log(`canvasDims: {${Object.entries(canvasDims)}}`)
  }, [canvasDims])

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
        />
      </>
    </StrictMode>
  )
}

export default App
