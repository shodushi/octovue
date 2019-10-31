import Home from './components/Home.vue';
import PrintPage from './components/PrintPage.vue';
import Stats from './components/StatsPage.vue';
import Settings from './components/SettingsPage.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/printpage', component: PrintPage },
    { path: '/stats', component: Stats },
    { path: '/settings', component: Settings },
];

export default routes;