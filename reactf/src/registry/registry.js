import Landing from '../Pages/Landing';
import SATsolver from '../Pages/SATsolver';
import Default from '../Pages/Default';

export const routeRegistry = [
    {
        path: "/",
        component: Default,
        name: "Home",
        hidden: true
    },
    {
        path: "/landing",
        component: Landing,
        name: "Landing",
        hidden: false
    },
    {
        path: "/tools/SATsolver",
        component: SATsolver,
        name: "SAT Solver",
        hidden: false
    }
];
