import Landing from '../Pages/Landing';
import SATsolver from '../Pages/SATsolver';
import Default from '../Pages/Default';
import AsyncDemo from '../Pages/AsyncDemo';

export const routeRegistry = [
    {
        path: "/",
        component: Default,
        name: "Home",
        hidden: true,
        category: "Main"
    },
    {
        path: "/landing",
        component: Landing,
        name: "Landing",
        hidden: false,
        category: "Main"
    },
    {
        path: "/tools/SATsolver",
        component: SATsolver,
        name: "SAT Solver",
        hidden: false,
        category: "Fun"
    },
    {
        path: "/tools/async-demo",
        component: AsyncDemo,
        name: "Async Demo",
        hidden: false,
        category: "Fun"
    }
];
