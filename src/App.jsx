import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import CuteChatbot from './Component/CuteChatbot.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CuteChatbot />
    </>
  )
}

export default App
