import { useState } from 'react';
import './App.css';
import Sketch from './Sketch';

function App() {
  // p5Prop is used to detect duplicate canvases
  const [p5Prop, setP5Prop] = useState(false);

  return (
    <>
      <Sketch p5Prop={p5Prop} setP5Prop={setP5Prop}/>
    </>
  )
}

export default App
