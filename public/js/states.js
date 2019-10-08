async function getLightState() {
	var url = cors_proxy+"/"+led_ip+"/light/3d_drucker_led/state";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function () {
	    var json = JSON.parse(xhr.responseText);
	    lightState_proxy.state = json.state;
	};
	xhr.send();
}
async function getPowerState() {
	var url = cors_proxy+"/"+tasmota_ip+"/cm?cmnd=Status";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function () {
	    var json = JSON.parse(xhr.responseText);
	    powerState_proxy.state = json.Status.Power;
	};
	xhr.send();
}
async function getConnectionState() {
	OctoPrint.connection.getSettings().done(data => {
		connectionState_proxy.state = data.current.state;
		connectionState_proxy.printerName = data.options.printerProfiles[0].name;
		if(data.current.state != "Closed") {
			getPrinterState();
		}
	});
}
async function getPrinterState() {
	if(connectionState.state != "Closed" && connectionState.state != "Offline") {
		OctoPrint.printer.getFullState().done(data => {
			printerState_proxy.state = data.state.text;
			if(data.temperature.bed != null) {
				printerState_proxy.temperature = {"bed": {"actual": data.temperature.bed.actual, "offset": data.temperature.bed.offset, "target": data.temperature.bed.target}, "tool0": {"actual": data.temperature.tool0.actual, "offset": data.temperature.tool0.offset, "target": data.temperature.tool0.target} };
			}
		});
	}
}
