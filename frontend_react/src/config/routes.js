import Landing from '../Pages/Landing';
import SATSolver from '../Pages/Fun/SATSolver';
import NotFound from '../Pages/NotFound';

export const routeRegistry = [
  {
    path: '/',
    component: Landing,
    name: 'Welcome',
    category: 'Main',
  },
  {
    path: '/tools/SATSolver',
    component: SATSolver,
    name: 'SAT Solver',
    category: 'Tools',
  },
  {
    path: '*',
    component: NotFound,
    hidden: true,
  },
];

export const visibleRoutes = routeRegistry.filter((route) => !route.hidden);

export const navigationGroups = Object.entries(
  visibleRoutes.reduce((groups, route) => {
    const category = route.category ?? 'Other';
    groups[category] = [...(groups[category] ?? []), route];
    return groups;
  }, {}),
).map(([name, routes]) => ({ name, routes }));
