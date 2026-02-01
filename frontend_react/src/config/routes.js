import Landing from '../Pages/Landing';
import SATSolver from '../Pages/Fun/SATSolver';
import AsyncDemo from '../Pages/Fun/AsyncDemo';
import PostScarcity from '../Pages/Thoughts/PostScarcity';
import RustPlayground from '../Pages/Labs/RustPlayground';

export const routeRegistry = [
    {
        path: "/",
        component: Landing,
        name: "Welcome",
        hidden: false,
        category: "Main"
    },
    {
        path: "/thoughts/post-scarcity",
        component: PostScarcity,
        name: "Post-Scarcity Society",
        hidden: false,
        category: "Thoughts"
    },
    {
        path: "/tools/rust-playground",
        component: RustPlayground,
        name: "Rust Playground",
        hidden: false,
        category: "Labs"
    },
    {
        path: "/tools/SATSolver",
        component: SATSolver,
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
