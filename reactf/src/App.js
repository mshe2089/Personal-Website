import { Routes, Route } from 'react-router-dom';
import Default from './Pages/Default';
import Landing from './Pages/Landing';
import SATsolver from './Pages/SATsolver';
import USYDmarks from './Pages/USYDmarks';

function App() {
  return (
    <>
       <Routes>
          <Route path="/" element={<Default />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/tools/SATsolver" element={<SATsolver />} />
          <Route path="/tools/USYDmarks" element={<USYDmarks />} />
       </Routes>
    </>
  );
}

export default App;
