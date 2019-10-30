import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import routes from './routes';
import VueLocalStorage from 'vue-localstorage'
import { globalSettings } from './globalSettings.js';
import { store } from './store/store.js'

import 'bulma/css/bulma.css'
import 'bulma-slider/dist/js/bulma-slider.min.js'
import 'bulma-slider/dist/css/bulma-slider.min.css'
import 'bulma-pageloader/dist/css/bulma-pageloader.min.css'
import 'bulma-switch/dist/css/bulma-switch.min.css'
require('@/assets/css/octomin.css')

Vue.config.productionTip = false

Vue.use(VueRouter);
const router = new VueRouter({mode: 'history', routes});

Vue.use(VueLocalStorage);

Vue.mixin(globalSettings);

Vue.prototype.$gcodes = [];
Vue.prototype.$gcodes['marlin'] = [];
Vue.prototype.$gcodes['reprap'] = [];

Vue.prototype.$fileList = [];
Vue.prototype.$selectedfile = {};
Vue.prototype.$selectedfolder = "";
Vue.prototype.$cam = "";
Vue.prototype.$file_origin = "local";

Vue.prototype.$gcodes['marlin'][0] = {"cmd": "emergencystop", "label": "Emergency stop", "icon": "fa-radiation", "gcmd": "M112"}
Vue.prototype.$gcodes['marlin'][1] = {"cmd": "stop", "label": "Stop print", "icon": "fa-stop-circle", "gcmd": "M2"};
Vue.prototype.$gcodes['marlin'][2] = {"cmd": "fanon", "label": "Fan on", "icon": "fa-fan", "gcmd": "M106"};
Vue.prototype.$gcodes['marlin'][3] = {"cmd": "fanoff", "label": "Fan off", "icon": "fa-fan", "gcmd": "M107"};
Vue.prototype.$gcodes['marlin'][4] = {"cmd": "homeaxes", "label": "Home all axes", "icon": "fa-home", "gcmd": "G28 W"};
Vue.prototype.$gcodes['marlin'][5] = {"cmd": "meshbedlevel", "label": "Mesh bed leveling", "icon": "fa-procedures", "gcmd": "G80"};
Vue.prototype.$gcodes['marlin'][6] = {"cmd": "motorsoff", "label": "Motors off", "icon": "fa-power-off", "gcmd": "M18"};
Vue.prototype.$gcodes['marlin'][7] = {"cmd": "unloadfilament", "label": "Unload filament", "icon": "fa-long-arrow-alt-up", "gcmd": "M702"};
Vue.prototype.$gcodes['marlin'][8] = {"cmd": "loadfilament", "label": "Load filament", "icon": "fa-long-arrow-alt-down", "gcmd": "M701"};
Vue.prototype.$gcodes['marlin'][9] = {"cmd": "changefilament", "label": "Change filament", "icon": "fa-arrows-alt-v", "gcmd": "M600"};

Vue.prototype.$gcodes['reprap'][0] = {"cmd": "emergencystop", "label": "Emergency stop", "icon": "fa-radiation", "gcmd": "M0"};
Vue.prototype.$gcodes['reprap'][1] = {"cmd": "stop", "label": "Stop print", "icon": "fa-stop-circle", "gcmd": "M1"};
Vue.prototype.$gcodes['reprap'][2] = {"cmd": "fanon", "label": "Fan on", "icon": "fa-fan", "gcmd": "M106"};
Vue.prototype.$gcodes['reprap'][3] = {"cmd": "fanoff", "label": "Fan off", "icon": "fa-fan", "gcmd": "M107"};
Vue.prototype.$gcodes['reprap'][4] = {"cmd": "homeaxes", "label": "Home all axes", "icon": "fa-home", "gcmd": "G28 W"};
Vue.prototype.$gcodes['reprap'][5] = {"cmd": "meshbedlevel", "label": "Mesh bed leveling", "icon": "fa-procedures", "gcmd": "G80"};
Vue.prototype.$gcodes['reprap'][6] = {"cmd": "motorsoff", "label": "Motors off", "icon": "fa-power-off", "gcmd": "M18"};
Vue.prototype.$gcodes['reprap'][7] = {"cmd": "unloadfilament", "label": "Unload filament", "icon": "fa-long-arrow-alt-up", "gcmd": "M702"};
Vue.prototype.$gcodes['reprap'][8] = {"cmd": "loadfilament", "label": "Load filament", "icon": "fa-long-arrow-alt-down", "gcmd": "M701"};
Vue.prototype.$gcodes['reprap'][9] = {"cmd": "changefilament", "label": "Change filament", "icon": "fa-arrows-alt-v", "gcmd": "M600"};


new Vue({
  store,
  router,
  render: h => h(App),
  routes
}).$mount('#app')
