import Home from './components/Home.vue';
import PrintPage from './components/PrintPage.vue';
import Stats from './components/StatsPage.vue';
import Settings from './components/SettingsPage.vue';
import Dashboard from './components/Dashboard.vue';
import LivePage from './components/Live4.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/printpage', component: PrintPage },
    { path: '/stats', component: Stats },
    { path: '/settings', component: Settings },
    { path: '/dashboard', component: Dashboard },
    { path: '/live', component: LivePage },
];

export default routes;