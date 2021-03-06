import { mapState } from 'vuex'
import * as SockJS from 'sockjs-client';
var StompJs = require('@stomp/stompjs');
import axios from "axios";
import Chart from 'vue-bulma-chartjs';

export const globalSettings = {
  components: {
    Chart
  },
  created:function() {
  },
  mounted:function() {
  },
  methods: {
    //thingiverse_results: [{"creator": "", "id": "", "is_private": "", "is_published": "", "is_purchased": "", "name": "", "public_url": "", "thumbnail": "", "url": ""}],
    formatTime(value) {
        value=value/60/60
        let val = (value/1).toFixed(2).replace(',', ':').replace('.', ':')+" h"
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    },
    formatTimeRemaining(value) {
      if(value == null || value == "") {
        return '00:00:00';
      } else {
        var sec_num = parseInt(value, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
      }
    },
    formatDecimal(value) {
        if(value == null) {
          value=0;
        }
        let val = (value/1).toFixed(2).replace(',', ':')
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    },
    formatLenght(value) {
        value=value/10;
        var val = ""
        if(value > 100) {
          val = (value/100).toFixed(2).replace('.', ',')+"m"
        } else if(value > 10) {
          val = (value/1).toFixed(2).replace('.', ',')+"cm"
        } else {
          val = (value*10).toFixed(2).replace('.', ',')+"mm"
        }
        
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    },
    formatDate: function(value) {
      if (value) {
        return new Date(value*1000).toLocaleDateString("de-DE", {day: '2-digit', month: '2-digit', year: 'numeric'});
      }
    },
    formatShorten: function(string, count) {
      var newstring = string;
      if(string.length > count) {
        newstring = newstring.substring(0,count)+"...";
      }
      return newstring;
    },
    sockConnection: function() {
      var self = this;
      var sock = new SockJS(this.$localStorage.get('octo_ip')+'/sockjs');
      const client = new StompJs.Client({
        brokerURL: "ws://127.0.0.1/sockjs", //dummy
        reconnectDelay: 2000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      client.webSocketFactory = function () {
        sock = new SockJS(self.$localStorage.get('octo_ip')+'/sockjs');
      };
      sock.onmessage = function(e) {
        self.messageParser(e.data);
        sock.close();
      };
      client.activate();
    },
    messageParser: function(msg) {
      //console.log(msg);
      if(msg.event != null) {
        //console.log(this.$store.state.printerState.payload);
          if(msg.event.type != null) {
            if(msg.event.type == "Connected" || msg.event.type == "Connecting") {
              var payload = {}
              payload.state_string = msg.event.type;
              this.$store.state.printerState.payload = payload;
            }
            if(msg.event.type == "PrinterStateChanged") {
              this.$store.state.printerState = msg.event;
              if(msg.event.type == "Connecting" || msg.event.payload.state_id == "OPEN_SERIAL" ||
              msg.event.payload.state_id == "DETECT_SERIAL" || 
              msg.event.payload.state_id == "DETECT_BAUDRATE" || 
              msg.event.payload.state_id == "CONNECTING") {
                  this.$store.state.isNotConnection = false;
                  this.$store.state.isConnection = false;
                  this.$store.state.isConnecting = true;
                  this.$store.state.connectionState = "...";
                  this.$store.state.printerState.payload.state_string = "Connecting";
              } else if(msg.event.payload.state_id == "OPERATIONAL" ||
                msg.event.payload.state_id == "PRINTING" || 
                msg.event.payload.state_id == "PAUSED" || 
                msg.event.payload.state_id == "TRANSFERING_FILE") {
                  this.$store.state.isNotConnection = false;
                  this.$store.state.isConnection = true;
                  this.$store.state.isConnecting = false;
                  this.$store.state.connectionState = "on";
              } else if(msg.event.payload.state_id == "CLOSED" ||
                msg.event.payload.state_id == "ERROR" || 
                msg.event.payload.state_id == "CLOSED_WITH_ERROR" || 
                msg.event.payload.state_id == "OFFLINE" || 
                msg.event.payload.state_id == "NONE") {
                  this.$store.state.isNotConnection = true;
                  this.$store.state.isConnection = false;
                  this.$store.state.isConnecting = false;
                  this.$store.state.connectionState = "off";
              }
            }
            if(msg.event.type == "DisplayLayerProgress-websocket-payload") {
              this.$store.state.totalLayer = msg.payload.totalLayer;
              this.$store.state.currentLayer = msg.payload.currentLayer;
              this.$store.state.totalHeight = msg.payload.totalHeight;
              this.$store.state.currentHeight = msg.payload.currentHeight;
              //this.currentHeight = msg.currentZ;
            }
            if(msg.event.type == "UpdatedFiles") {
                var self = this;
                this.loadFiles();
                setTimeout(function(){
                  self.listFiles()
                }, 2000);
            }
          }
      }
      if(msg.plugin != null) {
        
	/*
        if(msg.plugin.plugin == "DisplayLayerProgress") {
          if(msg.plugin.data.stateMessage != null) {
            this.$store.state.currentLayer = msg.plugin.data.stateMessage.split(" / ")[0];
            this.$store.state.totalLayer = msg.plugin.data.stateMessage.split(" / ")[1];
          }
          if(msg.plugin.data.heightMessage != null) {
            this.$store.state.currentHeight = msg.plugin.data.heightMessage.split("/")[0];
            this.$store.state.totalHeight = msg.plugin.data.heightMessage.split("/")[1].replace(/mm/i, '');
          }
        }
	*/
            if(msg.plugin.plugin == "DisplayLayerProgress-websocket-payload") {

              if(msg.plugin.data.currentLayer) {
                console.log(msg.plugin.data);
              }
              this.$store.state.totalLayer = msg.plugin.data.totalLayer;
              this.$store.state.currentLayer = msg.plugin.data.currentLayer;
              //this.$store.state.totalHeight = msg.plugin.data.totalHeight;
              this.$store.state.currentHeight = msg.plugin.data.currentHeight;
              //this.currentHeight = msg.currentZ;
            }

      }
      if(msg.current != null) {
        if(msg.current.temps != null) {
          if(msg.current.temps.length != 0) {
            this.$store.state.temps = msg.current.temps[0];
            this.updateGraphs();
            /*var temptool0_ist = (100/this.$store.state.temps.tool0.target)*this.$store.state.temps.tool0.actual;
            $("#temp_tool0_actual").css("height", temptool0_ist+"%");
            var tempbed_ist = (100/this.$store.state.temps.bed.target)*this.$store.state.temps.bed.actual;
            $("#temp_bed_actual").css("height", tempbed_ist+"%");
            //this.updateGauge(this.$store.state.temps.tool0.actual, this.$store.state.temps.bed.actual);*/
          }
        }
        if(msg.current.logs != null) {
          for(var i=0;i<msg.current.logs.length;i++) {
            if(msg.current.logs[i].includes("M117")) {
              const regex = /[0-9]*\/[0-9]*/g;
              var layers = msg.current.logs[i].match(regex);
              if(layers != null && layers.length > 0) {
                this.$store.state.currentLayer = layers[0].split("/")[0];
                this.$store.state.totalLayer = layers[0].split("/")[1];
              }
            }

            if(msg.current.logs[i].includes("G1") || msg.current.logs[i].includes("G0")) {
              if(msg.current.logs[i].includes("Z")) {
                const regex = /Z[0-9]*\.[0-9]*/g;
                var height = msg.current.logs[i].match(regex);
                if(height != null && height.length > 0) {
                  this.$store.state.currentHeight = height[0].split("Z")[1];
                  //this.totalH = height[0].split("/")[1];
                }
              }
            }

            //if(msg.current.logs[i].includes("G0") || msg.current.logs[i].includes("G1") || msg.current.logs[i].includes("G90") || msg.current.logs[i].includes("G91") || msg.current.logs[i].includes("G92")) {
            if(msg.current.logs[i].includes("Send:")) {
              var gcode = msg.current.logs[i].replace("Send: ", "");
              var regex = /N[0-9](.*) G/g;
              var match = gcode.match(regex);
              if(match != null && match.length > 0) {
                gcode = gcode.replace(match[0], "G");
                
                //gcode = gcode + " Z"+this.$store.state.currentHeight
              }

              var x = "";
              var y = "";
              var z = "";
              regex = /X[0-9]*\.[0-9]*/g;
              match = gcode.match(regex);
              if(match != null && match.length > 0) {
                x = match[0];
              }
              regex = /Y[0-9]*\.[0-9]*/g;
              match = gcode.match(regex);
              if(match != null && match.length > 0) {
                y = match[0];
              }
              if(x != "" && y != "") {
                var coord = {x: x.replace("X", ""), y: y.replace("Y",""), z: this.$store.state.currentHeight};
                this.$store.state.livegcodestring=(coord);
              }
              
              //this.$store.state.livegcodestring = this.$store.state.livegcodestring +gcode+"\n";
              //const regex2 = /F[0-9]*/g;
              /*var matchf = gcode.match(regex);
              if(matchf != null && matchf.length > 0) {
                gcode = gcode.replace(matchf[0], "");
                gcode = gcode + " F"+this.$store.state.currentHeight
              }*/

              //console.log(gcode);
            }

            if(this.$store.state.logs.length > 501) {
              this.$store.state.logs = this.$store.state.logs.splice(-500, 500)
            }
            this.$store.state.logs.push(msg.current.logs[i]);
            //this.$store.state.logs = templogs;
          }
        }
        
        if(msg.current.state != null) {
          if(msg.current.state.text != null && msg.current.state.text != "") {
            this.$store.state.printerState.payload.state_string = msg.current.state.text;
            //////this.$store.state.printerState.payload.state_id = msg.current.state.text;
          }
          if(msg.current.state.flags.ready || msg.current.state.flags.operational || msg.current.state.flags.cancelling || msg.current.state.flags.paused ||  msg.current.state.flags.printing || msg.current.state.flags.resuming || msg.current.state.flags.finishing) {
            this.$store.state.isNotConnection = false;
            this.$store.state.isConnection = true;
            this.$store.state.isConnecting = false;
            this.$store.state.connectionState = "on";
          } else if(msg.current.state.flags.error || msg.current.state.flags.closedOrError) {
            this.$store.state.isNotConnection = true;
            this.$store.state.isConnection = false;
            this.$store.state.isConnecting = false;
            this.$store.state.connectionState = "off";
          }
        }
        if(msg.current.state.flags != null) {
          this.$store.state.printerState.payload.flags = msg.current.state.flags;
        }
        if(msg.current.state.text == "Printing" && msg.current.busyFiles.length > 0) {
          this.$store.state.job.printfile = msg.current.busyFiles[0].path;
          this.$store.state.job.progress = msg.current.progress;
          this.$store.state.job.filament = msg.current.job.filament;
          this.$store.state.job.estimatedPrintTime = msg.current.job.estimatedPrintTime;
          this.$store.state.job.currentZ = msg.current.currentZ;
        }
        if(msg.current.progress != null) {
          if(msg.current.progress.completion != null) {
            this.$store.state.job.progress.completion = msg.current.progress.completion;
          }
          if(msg.current.progress.printTimeLeft != null) {
            this.$store.state.job.progress.printTimeLeft = msg.current.progress.printTimeLeft;
          }
          if(msg.current.progress.printTime != null) {
            this.$store.state.job.estimatedPrintTime = msg.current.job.estimatedPrintTime;
          }
          if(msg.current.progress.filepos != null) {
            this.$store.state.job.progress.filepos = msg.current.progress.filepos;
          }

        }
        if(msg.current.job != null) {
          if(msg.current.job.file != null) {
            this.$store.state.job.printfile = msg.current.job.file.name;
          }
        }
      }
      if(msg.history != null) {
        if(msg.history.logs != null && this.$store.state.logs != null) {
          if(msg.history.logs.length != 0 && this.$store.state.logs != null) {
            this.$store.state.logs = msg.history.logs
          }
        }
        if(msg.history.temps != null) {
          if(msg.history.temps.length > 0) {
            //this.temps = msg.history.temps[msg.history.temps.length-1]
          }
        }
        if(msg.history.state != null) {
          this.$store.state.printerState = {"type": "PrinterStateChanged", "payload":{"state_string": msg.history.state.text,"state_id":""}}
        }
      }
    },
    powerswitch: function() {
      axios({ method: "GET", "url": this.$localStorage.get('tasmota_ip')+this.$localStorage.get('tasmota_toggle') }).then(result => {
        this.getPowerState();
      }, error => {
        console.error(error);
      });
      /*
      axios({ method: "GET", "url": this.$localStorage.get('tasmota_ip')+this.$localStorage.get('tasmota_toggle') }).then(result => {
        this.$store.state.powerState = result.data.POWER.toLowerCase();
        //this.powerState = result.data.POWER.toLowerCase();
        if(this.powerState == "off") {
          this.$store.state.isNotPower = true;
          this.$store.state.isPower = false;
        } else {
          this.$store.state.isNotPower = false;
          this.$store.state.isPower = true;
        }
      }, error => {
          console.error(error);
      });
      */
    },
    getPowerState: function() {
      if(this.$localStorage.get('powerhandling') == "yes") {
        axios({ method: "GET", "url": this.$localStorage.get('tasmota_ip')+this.$localStorage.get('tasmota_status') }).then(result => {
          if(result.data != null) {
            if(result.data.state != null) {
              this.$store.state.powerState = result.data.state.toLowerCase();
              if(this.powerState == "off") {
                this.$store.state.isNotPower = true;
                this.$store.state.isPower = false;
              } else {
                this.$store.state.isNotPower = false;
                this.$store.state.isPower = true;
              }
            }
            if(result.data.Status != null) {
              if(result.data.Status.Power == "0") {
                this.$store.state.powerState = "off";
              } else {
                this.$store.state.powerState = "on";
              }
              if(this.powerState == "off") {
                this.$store.state.isNotPower = true;
                this.$store.state.isPower = false;
              } else {
                this.$store.state.isNotPower = false;
                this.$store.state.isPower = true;
              }
            }
          }
        }, error => {
            console.error(error);
        });
      }
      /*
      if(this.$localStorage.get('powerhandling') == "yes") {
        axios({ method: "GET", "url": this.$localStorage.get('tasmota_ip')+this.$localStorage.get('tasmota_status') }).then(result => {
          if(result.data.Status.Power == 0) {
            this.$store.state.powerState = 'off';
            this.$store.state.isNotPower = true;
            this.$store.state.isPower = false;
          } else {
            this.$store.state.powerState = 'on';
            this.$store.state.isNotPower = false;
            this.$store.state.isPower = true;
          }
        }, error => {
            console.error(error);
        });
      }
      */
    },
    lightswitch: function() {
      axios({ method: "POST", "url": this.$localStorage.get('led_ip')+this.$localStorage.get('led_toggle') }).then(result => {
        this.getLightState();
      }, error => {
        console.error(error);
      });
    },
    getLightState: function() {
      if(this.$localStorage.get('lighthandling') == "yes") {
        axios({ method: "GET", "url": this.$localStorage.get('led_ip')+this.$localStorage.get('led_status') }).then(result => {
          if(result.data != null) {
            if(result.data.state != null) {
              this.$store.state.lightState = result.data.state.toLowerCase();
              if(this.lightState == "off") {
                this.$store.state.isNotLight = true;
                this.$store.state.isLight = false;
              } else {
                this.$store.state.isNotLight = false;
                this.$store.state.isLight = true;
              }
            }
          }
          
        }, error => {
            console.error(error);
        });
      }
    },
    printerConnection: function() {
      var self = this;
      var obj = {};
      if(this.$store.state.isNotConnection) {
        obj.command = "connect";
        obj.port = this.$localStorage.get('printerport');
        obj.baudrate = parseInt(this.$localStorage.get('baudrate'));
        obj.printerProfile = this.$localStorage.get('printerProfile');
        obj.save = true;
        obj.autoconnect = false;
      } else {
        obj.command = "disconnect";
      }
      axios({ method: "POST", url: this.$localStorage.get('octo_ip')+"/api/connection", headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        /*this.$store.state.isNotConnection = false;
        this.$store.state.isConnection = false;
        this.$store.state.isConnecting = true;
        this.$store.state.connectionState = "...";*/
      }, error => {
          console.error(error);
      });
    },
    loadOctoprintSettings: function() {
      axios({ method: "GET", "url": this.$localStorage.get('octo_ip')+"/api/settings", headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
        this.$store.state.cam = result.data.webcam.streamUrl;
      }, error => {
          console.error(error);
      });
    },
    getOctoPrintProfiles: function() {
      axios({ method: "GET", "url": this.$localStorage.get('octo_ip')+"/api/printerprofiles", headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
        this.$store.printerProfiles = result.data;
        var graphs = [];
        var temps = {};
        var linegraphs = [];
        var colors = ['rgba(252, 60, 99, 1)','rgba(32, 203, 85, 1)','rgba(255, 216, 77, 1)','rgba(1, 203, 169, 1)','rgba(28, 146, 235, 1)','rgba(62, 117, 56, 1)','rgba(255, 76, 6, 1)'];
        var colors_alpha = ['rgba(252, 60, 99, 0.2)','rgba(32, 203, 85, 0.2)','rgba(255, 216, 77, 0.2)','rgba(1, 203, 169, 0.2)','rgba(28, 146, 235, 0.2)','rgba(62, 117, 56, 0.2)','rgba(255, 76, 6, 0.2)'];
        for(var i = 0; i < parseInt(result.data.profiles[this.$localStorage.get('printerProfile')].extruder.count); i++) {
          var key = "tool"+i;
          temps[key] = {"actual":"0","target":"0"};

          var obj = {};
          obj = {
            name: key,
            datasets: [{
              data: [0, 0, 290], // graph.options max value for extruder
              backgroundColor: [
                  colors[i],
                  colors_alpha[i],
                  '#C0C0C0'
              ]
              }],
              options: {
                  segmentShowStroke: false,
                  circumference: 1 * Math.PI,
                  rotation: 1 * Math.PI,
                  cutoutPercentage: 80
              }
          };

          var linegraph_actual = {
            label: key+'_actual',
            fill: false,
            backgroundColor: colors[i],
            borderColor: colors[i],
            borderWidth: 2,
            data: [0],
          };
          var linegraph_target = {
            label: key+'_target',
            fill: false,
            backgroundColor: colors_alpha[i],
            borderColor: colors_alpha[i],
            borderWidth: 6,
            data: [0],
          }

          graphs.push(obj);
          linegraphs.push(linegraph_actual);
          linegraphs.push(linegraph_target);
        }

        if(result.data.profiles[this.$localStorage.get('printerProfile')].heatedBed) {
          var key = "bed";
          temps[key] = {"actual":"0","target":"0"};
          var obj = {};

          obj = {
            name: key,
            datasets: [{
              data: [0, 0, 115], // graph.options max value for heatbed
              backgroundColor: [
                  colors[4],
                  colors_alpha[4],
                  '#C0C0C0'
              ]
              }],
              options: {
                  segmentShowStroke: false,
                  circumference: 1 * Math.PI,
                  rotation: 1 * Math.PI,
                  cutoutPercentage: 80
              }
          };
          var linegraph_actual = {
            label: key+'_actual',
            fill: false,
            backgroundColor: colors[4],
            borderColor: colors[4],
            borderWidth: 2,
            data: [0],
          };
          var linegraph_target = {
            label: key+'_target',
            fill: false,
            backgroundColor: colors_alpha[4],
            borderColor: colors_alpha[4],
            borderWidth: 6,
            data: [0],
          }

          graphs.push(obj);
          linegraphs.push(linegraph_actual);
          linegraphs.push(linegraph_target);
        }
        if(result.data.profiles[this.$localStorage.get('printerProfile')].heatedChamber) {
          var key = "chamber";
          temps[key] = {"actual":"0","target":"0"};
          var obj = {};

          obj = {
            name: key,
            datasets: [{
              data: [0, 0, 60],
              backgroundColor: [
                  '#ff06fc',
                  '#ff06fc',
                  '#C0C0C0'
              ]
              }],
              options: {
                  segmentShowStroke: false,
                  circumference: 1 * Math.PI,
                  rotation: 1 * Math.PI,
                  cutoutPercentage: 80
              }
          };
          var linegraph_actual = {
            label: key+'_actual',
            fill: false,
            backgroundColor: '#ff06fc',
            borderColor: '#ff06fc',
            borderWidth: 2,
            data: [0],
          };
          var linegraph_target = {
            label: key+'_target',
            fill: false,
            backgroundColor: '#ff06fc',
            borderColor: '#ff06fc',
            borderWidth: 6,
            data: [0],
          }

          graphs.push(obj);
          linegraphs.push(linegraph_actual);
          linegraphs.push(linegraph_target);
        }
        this.$store.state.graphs = graphs;
        this.$store.state.temps = temps;
        this.$store.state.line_temps.datasets = linegraphs;

      }, error => {
      });
    },
    transport: function(method, endpoint, url, object) {
      return axios({ method: method, "url": this.$localStorage.get(endpoint)+url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: object }).then(response => {
        return response;
      }, error => {
        //console.log("error in "+endpoint+"/"+url+": ", error);
        return error;
      });
    },
    changeFileSource: function(src) {
      this.$store.state.file_origin = src;
      this.loadFiles('');
    },
    selectFolder: function(path, index) {
      this.$store.state.selectedfolder = path;
      this.loadFiles(path);
    },
    selectMoveFolder: function(path) {
      this.$store.state.selectedmovefolder = path;
      this.listMoveFolders();
    },
    folderup: function() {
      this.$store.state.selectedfolder = this.$store.state.selectedfolder.substring(0, this.$store.state.selectedfolder.lastIndexOf('/'));
      this.loadFiles(this.$store.state.selectedfolder);
    },
    movefolderup: function() {
      this.$store.state.selectedmovefolder = this.$store.state.selectedmovefolder.substring(0, this.$store.state.selectedmovefolder.lastIndexOf('/'));
      this.listMoveFolders();
    },
    selectFile: function(event, file, index) {
      this.$store.state.selectedfile = file;
      $("#filestable tr").removeClass("is-selected");
      $("#filestable td").removeClass("is-selected");
      $(".file_buttons span").css("display", "none");
      $("#filerow"+index).addClass("is-selected");
      /*
      if(event.srcElement.parentElement.tagName == "TR") {
        $(event.srcElement.parentElement).addClass("is-selected");
      } else if(event.srcElement.parentElement.tagName == "FIGURE") {
        $(event.srcElement.parentElement.parentElement.parentElement).addClass("is-selected");
      } else {
        $(event.srcElement.parentElement.parentElement).addClass("is-selected");
      }
      */
      $("#fb_"+file.imgid+" span").css("display", "block");
      $("#fb_"+file.imgid+" span").removeAttr("disabled");
      $("#fileoperations span").removeAttr("disabled");
      $('#btn_cancel').attr("disabled", true);
    },
    loadFiles: function(path) {
      if(path == undefined || path == '') {
        path='';
      } else {
        path = '/'+path;
      }
      this.transport("GET", "octo_ip", "/api/files/"+this.$store.state.file_origin+path, null).then(result => {
          this.$store.state.fileList = [];
          this.$store.state.fileList = result.data;
          this.listFiles();
          //console.log("/api/files/"+this.$store.state.file_origin+path);
          //console.log(result.data);
          //this.listMoveFolders();
      });
    },
    loadAllFiles: function(path) {
      this.transport("GET", "octo_ip", "/api/files?recursive=true", null).then(result => {
          //this.$store.state.allFileList = [];
          //this.$store.state.allFileList = result.data;
          //this.listFiles();
          //console.log("/api/files/"+this.$store.state.file_origin+path);

          var list  = [];
          if(result.data != undefined) {
            list = result.data
          } else {
            list = result.data;
          }
          //console.log(list);
          this.findNode(list.files);
          //console.log(this.$store.state.allFileList);
          //this.listMoveFolders();
      });
    },
    imgFallback(event) {
      event.target.src = "img/placeholder.png"
    },
    findNode: function(arr) {
      for (const node of arr) {
        if (node.type == "machinecode") {
          this.$store.state.allFileList.push(node);
          //console.log(node);
        }
        if (node.children) {
          const child = this.findNode(node.children);
          if (child) return child;
        }
      }
    },
    searchFiles: function(q) {
      if(q.length > 0) {
        var self = this;
        var date;
        var tstamp;
        var day;
        var month;
        var imgid;
        var img;
        var download;
        this.$store.state.fileSearchResult = [];
        for (var i = 0; i < this.$store.state.allFileList.length; i++) {
          if(this.$store.state.allFileList[i].name.toLowerCase().includes(q.toLowerCase())) {
            if(this.$store.state.allFileList[i].refs.resource != null) {
              if(self.file_origin == "local" && this.$store.state.allFileList[i].refs.resource.includes(".gcode")) {
                img = this.$store.state.allFileList[i].refs.download.replace(".gcode", ".png");
                download = this.$store.state.allFileList[i].refs.download;
              }

              if(self.file_origin == "sdcard" && this.$store.state.allFileList[i].refs.resource.includes(".gco")) {
                img = this.$store.state.allFileList[i].refs.resource.replace(".gco", ".png");
                download = this.$store.state.allFileList[i].refs.resource;
              }
              imgid = this.$store.state.allFileList[i].display.replace(".", "").replace("~", "");
              if(this.$store.state.allFileList[i].date != null) {
                tstamp = new Date(this.$store.state.allFileList[i].date*1000);
                day = "0"+(tstamp.getDate());
                month = "0"+(tstamp.getMonth());
                date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
              } else {
                date = "";
              }
              this.$store.state.allFileList[i].download = download;
              this.$store.state.allFileList[i].img = img;
              this.$store.state.allFileList[i].imgid = imgid;
              this.$store.state.allFileList[i].thumbid = "thumb_"+imgid;
              this.$store.state.allFileList[i].hr_date = date;
              if(this.$store.state.allFileList[i].gcodeAnalysis == null) {
                this.$store.state.allFileList[i].gcodeAnalysis = {};
                this.$store.state.allFileList[i].gcodeAnalysis.estimatedPrintTime = null;
                this.$store.state.allFileList[i].gcodeAnalysis.filament = {"tool0": {"length": null, "volume": null}};
                this.$store.state.allFileList[i].gcodeAnalysis.printingArea = {"maxX": null, "maxY": null, "maxZ": null, "minX": null, "minY": null, "minZ": null};
              }
              if(this.$store.state.allFileList[i].gcodeAnalysis.dimensions == null) {
                this.$store.state.allFileList[i].gcodeAnalysis.dimensions = {"width": null, "depth": null, "height": null};
              }
            }
            this.$store.state.fileSearchResult.push(this.$store.state.allFileList[i]);
          }
        }
      } else {
        this.$store.state.fileSearchResult = [];
      } 
    },
    listFiles: function() {
      var self = this;
      this.$store.selectedfile = "";
      $("#filestable tr").removeClass("is-selected");
      $("#filestable td").removeClass("is-selected");
      $(".file_buttons span").css("display", "none");
      this.$store.state.files = [];
      this.$store.state.folders = [];
      var date;
      var tstamp;
      var day;
      var month;
      var imgid;
      var img;
      var download;
      var i;
      var list;
      if(this.$store.state.fileList.files != null) {
        list = this.$store.state.fileList.files
      } else {
        list = this.$store.state.fileList;
      }
      
      //undefined = has children || array = root dir array
      if(list.length == undefined) {
        list = list.children;
      } 
      for (i = 0; i < list.length; i++) {
        if(list[i].origin == this.file_origin) {
          if(list[i].type == "folder") {
            this.$store.state.folders.push(list[i]);
          } else if(list[i].type == "machinecode") {
            if(list[i].refs.resource != null) {
              if(self.file_origin == "local" && list[i].refs.resource.includes(".gcode")) {
                img = list[i].refs.download.replace(".gcode", ".png");
                download = list[i].refs.download;
              }

              if(self.file_origin == "sdcard" && list[i].refs.resource.includes(".gco")) {
                img = list[i].refs.resource.replace(".gco", ".png");
                download = list[i].refs.resource;
              }
              imgid = list[i].display.replace(".", "").replace("~", "");
              if(list[i].date != null) {
                tstamp = new Date(list[i].date*1000);
                day = "0"+(tstamp.getDate());
                month = "0"+(tstamp.getMonth());
                date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
              } else {
                date = "";
              }
              list[i].download = download;
              list[i].img = img;
              list[i].imgid = imgid;
              list[i].thumbid = "thumb_"+imgid;
              list[i].hr_date = date;
              if(list[i].gcodeAnalysis == null) {
                list[i].gcodeAnalysis = {};
                list[i].gcodeAnalysis.estimatedPrintTime = null;
                list[i].gcodeAnalysis.filament = {"tool0": {"length": null, "volume": null}};
                list[i].gcodeAnalysis.printingArea = {"maxX": null, "maxY": null, "maxZ": null, "minX": null, "minY": null, "minZ": null};
              }
              if(list[i].gcodeAnalysis.dimensions == null) {
                list[i].gcodeAnalysis.dimensions = {"width": null, "depth": null, "height": null};
              }
            }
            this.$store.state.files.push(list[i]);
          }
        }
      }
      this.$store.state.folders.sort((a, b) => a.name.localeCompare(b.name))
      this.$store.state.files.sort((a, b) => a.name.localeCompare(b.name));
    },



    //------------------------------------------------------------------------------------

    listMoveFolders: function() {
      var self = this;
      
      this.$store.state.movefolders = [];

      var path = this.selectedmovefolder.split("/");
      var pathobj;
      if(this.$store.state.selectedmovefolder.length > 0 && path[0] != "") { // Subfolder
        for(var i = 0; i<this.$store.state.fileList.length;i++) {
          if(this.$store.state.fileList[i].path == path[0]) {
            pathobj = this.$store.state.fileList[i];
          }
        }
        if(path.length > 1) {
          for(var n=1;n<path.length;n++) {
            for(var m=0;m<pathobj.children.length;m++) {
              if(pathobj.children[m].path == this.$store.state.selectedmovefolder) {
                pathobj = pathobj.children[m];
              }
            }
          }
        }

        var i;
        if(pathobj.children.length > 0) { //Subfolder
          for(i = 0; i<pathobj.children.length;i++) {
            if(pathobj.children[i].type == "folder") {
              this.$store.state.movefolders.push(pathobj.children[i]);
            }
          }
        }
      } else { // Main folder
        for (i = 0; i < this.$store.state.fileList.length; i++) {
          if(this.$store.state.fileList[i].origin == this.file_origin) {
            if(this.$store.state.fileList[i].type == "folder") {
              this.$store.state.movefolders.push(this.fileList[i]);
            }
          }
        }
      }
    },
    zoomIn: function(event, imgId, zoomId) {
      var zoomElement = document.getElementById(zoomId);
      zoomElement.style.display = "inline-block";
      var img = document.getElementById(imgId);
      var posX = event.offsetX ? (event.offsetX) : event.pageX - img.offsetLeft;
      var posY = event.offsetY ? (event.offsetY) : event.pageY - img.offsetTop;
      zoomElement.style.backgroundPosition=(-posX*3.5)+"px "+(-posY*4)+"px";
    },
    zoomOut: function(id) {
      var zoomElement = document.getElementById("overlay_"+id);
      zoomElement.style.display = "none";
    },
    loadprintFile: function(print, jump) {
      this.$store.state.printingfile = this.$store.state.selectedfile;
      this.$store.state.livegcode = [];
      this.$store.state.livegcodestring = "";
      var obj = {};
      obj.command = "select";
      obj.print = print;
      var folder = "";
      if(this.$store.state.selectedfolder != "") {
        folder = this.$store.state.selectedfolder+"/";
      }
      this.transport("POST", "octo_ip", "/api/files/"+this.$store.state.file_origin+"/"+folder+this.$store.state.selectedfile.display, obj).then(result => {
        if(typeof(result) == "object") {
          if(print) {
            $('#btn_cancel').attr("disabled", false);
            if(jump) {
              this.$router.push('printpage')
            }
          }
        }
      });
    },
    deleteFile: function() {
      var url = "";
      if(this.$store.state.selectedfolder == "") {
        url = "/api/files/local/"+this.$store.state.selectedfile.display;
      } else {
        url = "/api/files/local/"+this.$store.state.selectedfolder+"/"+this.$store.state.selectedfile.display;
      }
      this.transport("DELETE", "octo_ip", url, null).then(result => {
        if(typeof(result) == "object") {
          this.$store.state.selectedfile = null;
          $("#fileoperations span").attr("disabled", true);
          this.loadFiles();
        }
      });
    },
    moveFile: function() {
      var source = "";
      if(this.$store.state.selectedfolder == "") {
        source = "/api/files/local/"+this.$store.state.selectedfile.display;
      } else {
        source = "/api/files/local/"+this.$store.state.selectedfolder+"/"+this.$store.state.selectedfile.display;
      }
      var destination = "";
      if(this.$store.state.selectedmovefolder == "") {
        destination = "/api/files/local/"+this.$store.state.selectedfile.display;
      } else {
        destination = "/api/files/local/"+this.$store.state.selectedmovefolder+"/"+this.$store.state.selectedfile.display;
      }
      var obj = {};
      obj.origin = "local";
      obj.command = "move";
      obj.destination = destination;
      this.transport("POST", "octo_ip", source, JSON.stringify(obj)).then(result => {
        //console.log(result);
      });
    },
    cancelJob: function() {
      var obj = {};
      obj.command = "cancel";
      this.transport("POST", "octo_ip", "/api/job", JSON.stringify(obj)).then(result => {
        if(typeof(result) == "object") {
          $('#btn_cancel').attr("disabled", true);
        }
      });
    },
    pauseJob: function() {
      var obj = {};
      obj.command = "pause";
      obj.action = "pause";
      this.transport("POST", "octo_ip", "/api/job", JSON.stringify(obj)).then(result => {});
    },
    resumeJob: function() {
      var obj = {};
      obj.command = "pause";
      obj.action = "resume";
      this.transport("POST", "octo_ip", "/api/job", JSON.stringify(obj)).then(result => {});
    },
    setExtruderTemp: function(tool) {
      var temp = $("#slider"+tool).val();
      var obj = {};
      obj.command = "target";
      obj.targets = {};
      obj.targets[tool] = parseInt(temp);
      this.temps[tool].target = temp;
      this.transport("POST", "octo_ip", "/api/printer/tool", JSON.stringify(obj)).then(result => {
        if(typeof(result) == "object") {
          var temptool0_ist = (100/temp)*this.$store.state.temps.tool0.actual;
          $("#temp_tool0_actual").css("height", temptool0_ist+"%");
        }
      });
    },
    setBedTemp: function() {
      var temp = $("#sliderbed").val();
      var obj = {};
      obj.command = "target";
      obj.target = parseInt(temp);
      this.$store.state.temps.bed.target = temp;
      this.transport("POST", "octo_ip", "/api/printer/bed", JSON.stringify(obj)).then(result => {
        if(typeof(result) == "object") {
          var tempbed_ist = (100/temp)*this.$store.state.temps.bed.actual;
          $("#temp_bed_actual").css("height", tempbed_ist+"%");
        }
      });
    },
    setChamberTemp: function() {
      var temp = $("#sliderchamber").val();
      var obj = {};
      obj.command = "target";
      obj.target = parseInt(temp);
      this.$store.state.temps.chamber.target = temp;
      this.transport("POST", "octo_ip", "/api/printer/chamber", JSON.stringify(obj)).then(result => {
        if(typeof(result) == "object") {
          var tempbed_ist = (100/temp)*this.$store.state.temps.bed.actual;
          $("#temp_bed_actual").css("height", tempbed_ist+"%");
        }
      });
    },
    pcmds: function(gcmd) {
      var url = this.$localStorage.get('octo_ip')+"/api/printer/command";
      var obj = {};
      obj.command = gcmd;
      this.transport("POST", "octo_ip", "/api/printer/command", JSON.stringify(obj)).then(result => {});
    },
    windowOpen: function(url) {
      window.open(url, "_blank"); 
    },
    thingiverse_search: function() {
      this.$store.state.searchLoader = true;
      var url;
      var q;
      if(this.$store.state.q == "") {
        q = this.$store.state.q.replace(" ", "+");
        url = "http://cststudios.de/thingiverse/?action=init";
        axios({ method: "GET", url: url}).then(result => {
          this.$store.state.thingiverse_results = result.data;
          this.$store.state.searchLoader = false;
        }, error => {
            console.error(error);
            this.$store.state.searchLoader = false;
        });
      } else {
        q = this.$store.state.q.replace(" ", "+");
        url = "http://cststudios.de/thingiverse/?action=search&q="+q+"&page="+this.$store.state.thingpage;
        axios({ method: "GET", url: url}).then(result => {
          this.$store.state.thingiverse_results = result.data.hits;
          this.$store.state.searchLoader = false;
        }, error => {
            console.error(error);
            this.$store.state.searchLoader = false;
        });
      }
      
    },
    downloadThingFile: function(id, name) {
      name = name.replace(/ /g, "_").replace(/\\/g, "_");
      var url = "http://cststudios.de/thingiverse/?action=download&thingid="+id+"&thingname="+name;
      window.open(url, "_blank");
    },
    prevPage: function() {
      if(this.$store.state.thingpage > 1) {
        this.$store.state.thingpage = this.$store.state.thingpage -1;
      } else {
        this.$store.state.thingpage = 1
      }
    },
    nextPage: function() {
      this.$store.state.thingpage = this.$store.state.thingpage +1;
    },
    nav: function(page) {
      this.$store.state.page = page;
    },
    updateGraphs: function() {
      var percent_actual;
      var percent_target;
      var target;
      for(var obj in this.$store.state.temps) {
        
        if(obj != "bed" && obj != "chamber") {
          for(var i = 0; i< this.$store.state.graphs.length; i++) {
            if(this.$store.state.graphs[i].name == obj) {
              percent_actual = (100/290)*parseInt(this.$store.state.temps[obj].actual)
              percent_target = (100/290)*parseInt(this.$store.state.temps[obj].target)
              target = percent_target-percent_actual;
              if(target < 0) {
                target = 0;
              }
              this.$store.state.graphs[i].datasets[0].data = [percent_actual, target, 100-percent_target];
            }
            for(var n=0;n<this.$store.state.line_temps.datasets.length;n++) {
              if(this.$store.state.line_temps.datasets[n].data.length > 10) {
                this.$store.state.line_temps.datasets[n].data = this.$store.state.line_temps.datasets[n].data.splice(-200, 200)
              }
              if(this.$store.state.line_temps.datasets[n].label == obj+"_actual") {
                this.$store.state.line_temps.datasets[n].data.push({x:this.$store.state.line_temps.datasets[n].data.length+1, y:parseInt(this.$store.state.temps[obj].actual)});
              }
              if(this.$store.state.line_temps.datasets[n].label == obj+"_target") {
                this.$store.state.line_temps.datasets[n].data.push({x:this.$store.state.line_temps.datasets[n].data.length+1, y:parseInt(this.$store.state.temps[obj].target)});
              }
            }
          }
        }
        if(obj == "bed") {
          for(var i = 0; i< this.$store.state.graphs.length; i++) {
            if(this.$store.state.graphs[i].name == obj) {
              percent_actual = (100/115)*parseInt(this.$store.state.temps[obj].actual)
              percent_target = (100/115)*parseInt(this.$store.state.temps[obj].target)
              target = percent_target-percent_actual;
              if(target < 0) {
                target = 0;
              }
              this.$store.state.graphs[i].datasets[0].data = [percent_actual, target, 100-percent_target];
            }
            for(var n=0;n<this.$store.state.line_temps.datasets.length;n++) {
              if(this.$store.state.line_temps.datasets[n].data.length > 200) {
                this.$store.state.line_temps.datasets[n].data = this.$store.state.line_temps.datasets[n].data.splice(-200, 200)
              }
              if(this.$store.state.line_temps.datasets[n].label == obj+"_actual") {
                this.$store.state.line_temps.datasets[n].data.push({x:this.$store.state.line_temps.datasets[n].data.length+1, y:parseInt(this.$store.state.temps[obj].actual)});
              }
              if(this.$store.state.line_temps.datasets[n].label == obj+"_target") {
                this.$store.state.line_temps.datasets[n].data.push({x:this.$store.state.line_temps.datasets[n].data.length+1, y:parseInt(this.$store.state.temps[obj].target)});
              }
            }
          }
        }
        if(obj == "chamber") {
          for(var i = 0; i< this.$store.state.graphs.length; i++) {
            if(this.$store.state.graphs[i].name == obj) {
              percent_actual = (100/60)*parseInt(this.$store.state.temps[obj].actual)
              percent_target = (100/60)*parseInt(this.$store.state.temps[obj].target)
              target = percent_target-percent_actual;
              if(target < 0) {
                target = 0;
              }
              this.$store.state.graphs[i].datasets[0].data = [percent_actual, target, 100-percent_target];
            }
            for(var n=0;n<this.$store.state.line_temps.datasets.length;n++) {
              if(this.$store.state.line_temps.datasets[n].data.length > 200) {
                this.$store.state.line_temps.datasets[n].data = this.$store.state.line_temps.datasets[n].data.splice(-200, 200)
              }
              if(this.$store.state.line_temps.datasets[n].label == obj+"_actual") {
                this.$store.state.line_temps.datasets[n].data.push({x:this.$store.state.line_temps.datasets[n].data.length+1, y:parseInt(this.$store.state.temps[obj].actual)});
              }
              if(this.$store.state.line_temps.datasets[n].label == obj+"_target") {
                this.$store.state.line_temps.datasets[n].data.push({x:this.$store.state.line_temps.datasets[n].data.length+1, y:parseInt(this.$store.state.temps[obj].target)});
              }
            }
          }
        }
        if(this.$store.state.line_temps.labels.length > 200) {
          this.$store.state.line_temps.labels = this.$store.state.line_temps.labels.splice(-200, 200)
        }
        this.$store.state.line_temps.labels.push('');
      }
    },
    displayMsg: function(error) {
      switch(error) {
        case "octoprint_conn_error":
          $("#messagebox_body").html("Connection to OctoPrint server failed. Is it offline?");
          $("#messagebox").show( "slow" );
          setTimeout(function(){
            $("#messagebox").hide( "slow" );
          }, 8000);
          break;
        case "upload_invalid_file":
          $("#messagebox_body").html("Only gcode files possible to upload");
          $("#messagebox").show( "slow" );
          setTimeout(function(){
            $("#messagebox").hide( "slow" );
          }, 8000);
          break;
        case "octoprint_printersetup_error":
          $("#messagebox_body").html("Please setup printer details in OctoVue settings first.");
          $("#messagebox").show( "slow" );
          setTimeout(function(){
            $("#messagebox").hide( "slow" );
          }, 8000);
          break;
        default:
          console.log("unhandled msg error");
      }
    },
    getStats: function() {
      var allfiles = [];
      this.transport("GET", "octo_ip", "/api/files?recursive=true", null).then(result => {
        if(typeof(result) == "object") {
          allfiles = result.data.files;

          var s = 0;
          var f = 0;
          var img;
          var imgid;
          for(var i = 0; i<allfiles.length;i++) {
            var obj = allfiles[i];
            if(obj.type == "machinecode") {
              if(obj.prints != null) {
                if(obj.prints.success != null) {
                  if(obj.prints.success > 0 || obj.prints.failure > 0) {
                    f = f + obj.prints.success;
                    s = s + obj.prints.failure;
                  }
                }

                if(obj.origin == "local") {
                  img = obj.refs.download.replace(".gcode", ".png");
                }
                imgid = obj.display.replace(".", "");
                obj.img = img;
                obj.imgid = imgid;
                obj.thumbid = "thumb_"+imgid;
                if(obj.prints.last != null) {
                  if(obj.prints.last.date != null) {
                    this.$store.state.printhistory.push({"date": obj.prints.last.date.toString().split(".")[0], "file": obj});
                  }
                }
              }
            }
            if(obj.type == "folder") {
              for(var n = 0; n<obj.children.length;n++) {
                if(obj.children[n].type == "machinecode") {
                  if(obj.children[n].prints != null) {
                    if(obj.children[n].prints.success != null) {
                      if(obj.children[n].prints.success > 0 || obj.children[n].prints.failure > 0) {
                        f = f + obj.children[n].prints.success;
                        s = s + obj.children[n].prints.failure;
                      }
                    }

                    if(obj.children[n].origin == "local") {
                      img = obj.children[n].refs.download.replace(".gcode", ".png");
                    }
                    imgid = obj.children[n].display.replace(".", "");
                    obj.children[n].img = img;
                    obj.children[n].imgid = imgid;
                    obj.children[n].thumbid = "thumb_"+imgid;
                    if(obj.children[n].prints.last != null) {
                      if(obj.children[n].prints.last.date != null) {
                        this.$store.state.printhistory.push({"date": obj.children[n].prints.last.date.toString().split(".")[0], "file": obj.children[n]});
                      }
                    }
                  }
                }
              }
            }
          }
          this.$store.state.printhistory.sort(this.compare);
          this.$store.state.stats.success = s;
          this.$store.state.stats.failure = f;
          this.$store.state.pie_stats_printing.datasets[0].data = [s, f];
          if(this.$refs.pie_stats_printing) {
            this.$refs.pie_stats_printing.chart.update();
          }

          //bar chart for monthly prints
          var d = new Date();
          d.setDate(1);
          var labels = [];
          var temp = [];
          for (i=0; i<=11; i++) {
            labels.push(("0" + (d.getMonth() + 1)).slice(-2) +" "+ d.getFullYear())
            temp[("0" + (d.getMonth() + 1)).slice(-2) +" "+ d.getFullYear()] = 0;
            d.setMonth(d.getMonth() - 1);
          }
          labels.reverse();

          for(var i = 0; i < this.$store.state.printhistory.length; i++) {
            var obj = this.$store.state.printhistory[i];
            var month = new Date(obj.date*1000).toLocaleDateString("de-DE", {month: '2-digit'});
            var year = new Date(obj.date*1000).toLocaleDateString("de-DE", {year: 'numeric'});
            var date = month+" "+year;
            
            if(labels.includes(date)) {
              temp[''+date] = temp[''+date]+obj.file.prints.success+obj.file.prints.failure; 
            }
          }
          for(var i = 0; i < labels.length; i++) {
            this.$store.state.bar_stats_printing.datasets[0].data.push(temp[labels[i]]);
          }
          this.$store.state.bar_stats_printing.labels = labels;
          if(this.$refs.bar_stats_printing) {
            this.$refs.bar_stats_printing.chart.update();
          }

        }
      });
    },
    compare: function( a, b ) {
      if ( a.date < b.date ){
        return 1;
      }
      if ( a.date > b.date ){
        return -1;
      }
      return 0;
    },
    back: function() {
        this.$router.go(-1);
    },
    toggleTerminal: function() {
      this.$store.state.terminalmodal = !this.$store.state.terminalmodal;
    },
    toggleInfo: function() {
      this.$store.state.infomodal = !this.$store.state.infomodal;
    },
    toggleModalFileMove: function() {
      this.$store.state.modalfilemove = !this.$store.state.modalfilemove;
      if(this.$store.state.modalfilemove) {
        this.listMoveFolders();
      } else {
        this.$store.state.selectedmovefolder = "";
      }
      //console.log(this.$store.state.folders);
    },
    configFromFile: function() {
      if(this.$localStorage.get('octo_ip') == null || this.$localStorage.get('apikey') == null) {
        var locationHref = window.location.href.replace("/#", "");
        axios({ method: "GET", url: locationHref+"/octovue_config.txt"}).then(result => {
          if(result.status == 200 && typeof(result.data.octo_ip) !== 'undefined' && typeof(result.data.apikey) !== 'undefined') {
            var config = result.data;
            this.$localStorage.set('octo_ip', config.octo_ip);
            this.$localStorage.set('apikey', config.apikey);
            this.$localStorage.set('printerport', config.printerport);
            this.$localStorage.set('baudrate', config.baudrate);
            this.$localStorage.set('printerProfile', config.printerProfile);
            this.$localStorage.set('printer_firmware', config.printer_firmware);
            if(config.previewimages) {
              this.$localStorage.set('previewimages', 'yes');
            } else {
              this.$localStorage.set('previewimages', 'no');
            }
            if(config.powerhandling) {
              this.$localStorage.set('powerhandling', 'yes');
            } else {
              this.$localStorage.set('powerhandling', 'no');
            }
            this.$localStorage.set('tasmota_ip', config.tasmota_ip);
            this.$localStorage.set('tasmota_toggle', config.tasmota_toggle);
            this.$localStorage.set('tasmota_status', config.tasmota_status);
            if(config.lighthandling) {
              this.$localStorage.set('lighthandling', 'yes');
            } else {
              this.$localStorage.set('lighthandling', 'no');
            }
            this.$localStorage.set('led_ip', config.led_ip);
            this.$localStorage.set('led_toggle', config.led_toggle);
            this.$localStorage.set('led_status', config.led_status);
            this.$localStorage.set('cors_proxy', config.cors_proxy);
            if(config.lightuseproxy) {
              this.$localStorage.set('lightuseproxy', 'yes');
            } else {
              this.$localStorage.set('lightuseproxy', 'no');
            }
            if(config.poweruseproxy) {
              this.$localStorage.set('poweruseproxy', 'yes');
            } else {
              this.$localStorage.set('poweruseproxy', 'no');
            }
            if(config.theme != null) {
              this.$localStorage.set('theme', config.theme);
            } else {
              this.$localStorage.set('theme', 'light');
            }
            if(this.$localStorage.get('octo_ip') != null && this.$localStorage.get('apikey') != null) {
              this.$router.go();
            }
          }
        }, error => {
            console.error(error);
        });
      }
    },
    printHead(command, x, y, z, axes, factor) {
      var obj = {};
      obj.command = command;
      obj.x = parseInt(x);
      obj.y = parseInt(y);
      obj.z = parseInt(z);
      obj.axes = axes;
      obj.factor = parseInt(factor);
      this.transport("POST", "octo_ip", "/api/printer/printhead", obj).then(result => {
        /*
        if(typeof(result) == "object") {

        } else {
          console.log(result);
        }
        */
      });
    },
    toolCommand(command, tool, offsets, amount, factor) {
      var obj = {};
      obj.command = command;
      obj.tool = tool;
      obj.offsets = offsets;
      obj.amount = parseInt(amount);
      obj.factor = parseInt(factor);
      this.transport("POST", "octo_ip", "/api/printer/tool", obj).then(result => {
        /*
        if(typeof(result) == "object") {

        } else {
          console.log(result);
        }
        */
      });
    }
  },
  computed: {
    ...mapState([
      'temp',
      'page',
      'infomodal',
      'modalfilemove',
      'terminalmodal',
      'settingsmodal',
      'printerState',
      'printerProfiles',
      'avail_printerports',
      'avail_baudrates',
      'temps',
      'graphs',
      'logs',
      'cam',
      'powerState',
      'lightState',
      'connectionState',
      'connectionSettings',
      'isPower',
      'isNotPower',
      'isLight',
      'isNotLight',
      'isConnection',
      'isNotConnection',
      'isConnecting',
      'fileList',
      'allFileList',
      'fileSearchResult',
      'selectedfolder',
      'selectedmovefolder',
      'selectedfile',
      'files',
      'folders',
      'currentLayer',
      'totalLayer',
      'currentHeight',
      'totalHeight',
      'file_origin',
      'searchLoader',
      'pageLoader',
      'pageLoaderAddText',
      'octoprintConnectionTries',
      'octoprintConnectionMaxTries',
      'printhistory',
      'job',
      'thingiverse_results',
      'q',
      'thingpage',
      'stats',
      'pie_tool0',
      'pie_tool0_options',
      'pie_bed',
      'pie_bed_options',
      'line_temps',
      'line_temps_options',
      'pie_stats_printing',
      'pie_stats_printing_options',
      'bar_stats_printing',
      'bar_stats_printing_options',
      'octoprintCommands',
      'livegcode',
      'livegcodestring',
      'printingfile',
      'gcodeBuffer',
    ]),
    terminalLogs: {
      get() {
        if(this.$store.state.logs.length > 0) {
          return this.$store.state.logs.join('\n')
        }
      }
    },
    q: {
      get() {
        return this.$store.state.q;
      },
      set(value) {
        this.$store.state.q=value;
      },
    },
  }
}
