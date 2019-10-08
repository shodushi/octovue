var gcodes = [];
gcodes['marlin'] = [];
gcodes['reprap'] = [];

// power handling
// here used sonoff with tasmota for power switching the printer
// set powerhandling = "no" if not used
var powerhandling = "yes";
var tasmota_ip = "192.168.120.81";

// light handling
// here used nodemcu with esphome for controlling the enclosure leds
// set lighthandling = "no" if not used
var lighthandling = "yes";
var led_ip = "http://192.168.120.45";

// octoprint api
var octo_ip = "http://192.168.120.244:5000";
var apikey = "86DA1D669334418CB773A50A142A4E72";

// only used if using external devices like tasmota or esphome devices
// see https://www.npmjs.com/package/cors-anywhere for more info
var cors_proxy = "http://192.168.120.244:8090"

// enable/disable preview image of gcode files
//var previewimages = "no";

var printer_firmware = "marlin";

var printerState = {"type": "PrinterStateChanged", "payload":{"state_string":"Offline","state_id":"OFFLINE"}}

gcodes['marlin'].push({"cmd": "emergencystop", "label": "Emergency stop", "icon": "fa-radiation", "gcmd": "M112"});
gcodes['marlin'].push({"cmd": "stop", "label": "Stop print", "icon": "fa-stop-circle", "gcmd": "M2"});
gcodes['marlin'].push({"cmd": "fanon", "label": "Fan on", "icon": "fa-fan", "gcmd": "M106"});
gcodes['marlin'].push({"cmd": "fanoff", "label": "Fan off", "icon": "fa-fan", "gcmd": "M107"});
gcodes['marlin'].push({"cmd": "homeaxes", "label": "Home all axes", "icon": "fa-home", "gcmd": "G28 W"});
gcodes['marlin'].push({"cmd": "meshbedlevel", "label": "Mesh bed leveling", "icon": "fa-procedures", "gcmd": "G80"});
gcodes['marlin'].push({"cmd": "motorsoff", "label": "Motors off", "icon": "fa-power-off", "gcmd": "M18"});
gcodes['marlin'].push({"cmd": "unloadfilament", "label": "Unload filament", "icon": "fa-long-arrow-alt-up", "gcmd": "M702"});
gcodes['marlin'].push({"cmd": "loadfilament", "label": "Load filament", "icon": "fa-long-arrow-alt-down", "gcmd": "M701"});
gcodes['marlin'].push({"cmd": "changefilament", "label": "Change filament", "icon": "fa-arrows-alt-v", "gcmd": "M600"});

gcodes['reprap'].push({"cmd": "emergencystop", "label": "Emergency stop", "icon": "fa-radiation", "gcmd": "M0"});
gcodes['reprap'].push({"cmd": "stop", "label": "Stop print", "icon": "fa-stop-circle", "gcmd": "M1"});
gcodes['reprap'].push({"cmd": "fanon", "label": "Fan on", "icon": "fa-fan", "gcmd": "M106"});
gcodes['reprap'].push({"cmd": "fanoff", "label": "Fan off", "icon": "fa-fan", "gcmd": "M107"});
gcodes['reprap'].push({"cmd": "homeaxes", "label": "Home all axes", "icon": "fa-home", "gcmd": "G28 W"});
gcodes['reprap'].push({"cmd": "meshbedlevel", "label": "Mesh bed leveling", "icon": "fa-procedures", "gcmd": "G80"});
gcodes['reprap'].push({"cmd": "motorsoff", "label": "Motors off", "icon": "fa-power-off", "gcmd": "M18"});
gcodes['reprap'].push({"cmd": "unloadfilament", "label": "Unload filament", "icon": "fa-long-arrow-alt-up", "gcmd": "M702"});
gcodes['reprap'].push({"cmd": "loadfilament", "label": "Load filament", "icon": "fa-long-arrow-alt-down", "gcmd": "M701"});
gcodes['reprap'].push({"cmd": "changefilament", "label": "Change filament", "icon": "fa-arrows-alt-v", "gcmd": "M600"});