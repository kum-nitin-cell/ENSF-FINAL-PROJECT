import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <div className="App">
        <h1>ENSF FINAL PROJECT</h1>
        <p>Authentication base is now active!</p>
      </div>
    </AuthProvider>
  )
}

export default App
