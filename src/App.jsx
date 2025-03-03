import { useState } from 'react'
import AirQuality from './AirQuality'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <AirQuality/>
    </>
  )
}

export default App
