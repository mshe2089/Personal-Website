import { Routes, Route } from 'react-router-dom';
import { routeRegistry } from './registry/registry';

function App() {
  return (
    <div className="App">
      <Routes>
        {routeRegistry.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </div>
  );
}

export default App;
