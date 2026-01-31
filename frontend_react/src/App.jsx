import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { routeRegistry } from './config/routes';

function App() {
  const location = useLocation();

  return (
    <div className="text-left flex flex-col flex-1 w-full bg-primary text-primary font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          <Routes location={location}>
            {routeRegistry.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default App;
