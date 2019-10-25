import Home from './components/Home.vue';
import PrintPage from './components/PrintPage.vue';
import Stats from './components/StatsPage.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/printpage', component: PrintPage },
    { path: '/stats', component: Stats },
];

export default routes;