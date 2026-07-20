import { Routes, Route } from 'react-router-dom'
import { Nav } from '@/components/Nav'
import Home from '@/pages/Home'
import Gallery from '@/pages/Gallery'

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </>
  )
}

export default App
