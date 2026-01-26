import { Routes, Route } from 'react-router-dom';
import { routeRegistry } from './registry/registry';

function App() {
  return (
    <>
      <Routes>
        {routeRegistry.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </>
  );
}

export default App;
