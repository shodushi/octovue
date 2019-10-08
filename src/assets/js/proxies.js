var powerState = {};
var powerState_proxy = new Proxy(powerState, {
  set: function(obj, prop, value) {
    obj[prop] = value;
    updateUI();
    return true;
  },
});
var lightState = {};
var lightState_proxy = new Proxy(lightState, {
  set: function(obj, prop, value) {
    obj[prop] = value;
    updateUI();
    return true;
  },
});
var connectionState = {};
var connectionState_proxy = new Proxy(connectionState, {
  set: function(obj, prop, value) {
    obj[prop] = value;
    updateUI();
    return true;
  },
});

var printerState = {};
var printerState_proxy = new Proxy(printerState, {
  set: function(obj, prop, value) {
    obj[prop] = value;
    updateUI();
    return true;
  },
});