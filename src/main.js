import Vue from 'vue'
import App from './App.vue'


// -----        EDIT YOUR SEETINGS FROM HERE      -----
//-----------------------------------------------------

// octoprint api
Vue.prototype.$octo_ip = "http://192.168.120.244:5000";
Vue.prototype.$apikey = "86DA1D669334418CB773A50A142A4E72";

// octoprint printer settings
Vue.prototype.$port = "/dev/ttyACM0";
Vue.prototype.$baudrate = 115200;
Vue.prototype.$printerProfile = "_default";

// set your type of printer firmware (marlin or reprap)
Vue.prototype.$printer_firmware = "marlin";

// led controlling via external device like any esp device via http call
Vue.prototype.$powerhandling = "yes";
Vue.prototype.$tasmota_ip="192.168.120.81"

// printer power switch via sonoff tasmota
Vue.prototype.$lighthandling = "yes";
Vue.prototype.$led_ip = "http://192.168.120.45";

// only used if using external devices like tasmota or esphome devices
// see https://www.npmjs.com/package/cors-anywhere for more info
Vue.prototype.$cors_proxy = "http://192.168.120.244:8090"

// enable/disable preview image of gcode files
Vue.prototype.$previewimages = "yes";

//---------------------------------------------------
// -----        EDIT YOUR SEETINGS TO HERE      -----








Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')

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