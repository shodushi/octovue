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
      if(msg.event != null) {
          if(msg.event.type != null) {
              if(msg.event.type == "PrinterStateChanged") {
                  this.$store.state.printerState = msg.event;
                  if(this.$store.state.printerState.payload.state_string != "Operational" && this.$store.state.printerState.payload.state_string != "Connecting" && this.$store.state.printerState.payload.state_string != "Paused") {
                    this.$store.state.isNotConnection = true;
                    this.$store.state.isConnection = false;
                    this.$store.state.isConnecting = false;
                    this.$store.state.connectionState = "off";
                  } else if(this.printerState.payload.state_string == "Connecting") {
                    this.$store.state.isNotConnection = false;
                    this.$store.state.isConnection = true;
                    this.$store.state.isConnecting = true;
                    this.$store.state.connectionState = "...";
                  } else {
                    this.$store.state.isNotConnection = false;
                    this.$store.state.isConnection = true;
                    this.$store.state.isConnecting = false;
                    this.$store.state.connectionState = "on";
                  }
              }
              if(msg.event.type == "DisplayLayerProgress_layerChanged" || msg.event.type == "DisplayLayerProgress_heightChanged") {
                this.$store.state.totalLayer = msg.payload.totalLayer;
                this.$store.state.currentLayer = msg.payload.currentLayer;
                this.$store.state.totalHeight = msg.payload.totalHeightWithExtrusion;
                this.$store.state.currentHeight = msg.payload.currentHeight;
                //this.currentHeight = msg.currentZ;
              }
              if(msg.event.type == "UpdatedFiles") {
                  this.loadFiles();
              }
          }
      }
      if(msg.plugin != null) {
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
      }
      if(msg.current != null) {
        if(msg.current.temps != null) {
          if(msg.current.temps.length != 0) {
            if(msg.current.temps[0].tool0 != null) {
              this.$store.state.temps = msg.current.temps[0];
              var temptool0_ist = (100/this.$store.state.temps.tool0.target)*this.$store.state.temps.tool0.actual;
              $("#temp_tool0_actual").css("height", temptool0_ist+"%");
              var tempbed_ist = (100/this.$store.state.temps.bed.target)*this.$store.state.temps.bed.actual;
              $("#temp_bed_actual").css("height", tempbed_ist+"%");
              this.updateGauge(this.$store.state.temps.tool0.actual, this.$store.state.temps.bed.actual);
              this.updateTempChart(this.$store.state.temps.tool0.actual, this.$store.state.temps.tool0.target, this.$store.state.temps.bed.actual,  this.$store.state.temps.bed.target);
            }
          }
        }
        if(msg.current.logs != null) {
          var templogs = [];
          for(var i=0;i<msg.current.logs.length;i++) {
            if(msg.current.logs[i].includes("M117")) {
              const regex = /[0-9]*\/[0-9]*/g;
              var layers = msg.current.logs[i].match(regex);
              if(layers != null && layers.length > 0) {
                this.$store.state.currentLayer = layers[0].split("/")[0];
                this.$store.state.totalLayer = layers[0].split("/")[1];
              }
            }

            if(msg.current.logs[i].includes("G1")) {
              if(msg.current.logs[i].includes("Z")) {
                const regex = /Z[0-9]*\.[0-9]*/g;
                var height = msg.current.logs[i].match(regex);
                if(height != null && height.length > 0) {
                  this.$store.state.currentHeight = height[0].split("Z")[1];
                  //this.totalH = height[0].split("/")[1];
                }
              }
            }

            if(this.$store.state.logs.length > 500) {
              templogs = this.$store.state.logs.splice(-500, 500)
            }
            templogs.push(msg.current.logs[i]);
            this.$store.state.logs = templogs;
          }
        }
        if(msg.current.state != null) {
          this.$store.state.printerState.payload.state_string = msg.current.state.text;
          if(this.$store.state.printerState.payload.state_string != "Operational" && this.$store.state.printerState.payload.state_string != "Connecting" && this.$store.state.printerState.payload.state_string != "Cancelling" && this.$store.state.printerState.payload.state_string != "Paused") {
            this.$store.state.isNotConnection = true;
            this.$store.state.isConnection = false;
            this.$store.state.isConnecting = false;
            this.$store.state.connectionState = "off";
          } else if(this.$store.state.printerState.payload.state_string == "Connecting") {
            this.$store.state.isNotConnection = false;
            this.$store.state.isConnection = true;
            this.$store.state.isConnecting = true;
            this.$store.state.connectionState = "...";
          } else {
            this.$store.state.isNotConnection = false;
            this.$store.state.isConnection = true;
            this.$store.state.isConnecting = false;
            this.$store.state.connectionState = "on";
          }
        }
        if(msg.current.state.text == "Printing" && msg.current.busyFiles.length > 0) {
          this.$store.state.job.printfile = msg.current.busyFiles[0].path;
          this.$store.state.job.progress = msg.current.progress;
          this.$store.state.job.filament = msg.current.job.filament;
          this.$store.state.job.estimatedPrintTime = msg.current.job.estimatedPrintTime;
          this.$store.state.job.currentZ = msg.current.currentZ;
        }
      }
      if(msg.history != null) {
        if(msg.history.logs != null) {
          if(msg.history.logs.length != 0) {
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
      axios({ method: "GET", "url": this.$localStorage.get('cors_proxy')+"/"+this.$localStorage.get('tasmota_ip')+"/cm?cmnd=Power%20TOGGLE" }).then(result => {
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
    },
    getPowerState: function() {
      if(this.$localStorage.get('powerhandling') == "yes") {
        axios({ method: "GET", "url": this.$localStorage.get('cors_proxy')+"/"+this.$localStorage.get('tasmota_ip')+"/cm?cmnd=Status" }).then(result => {
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
    },
    lightswitch: function() {
      axios({ method: "POST", "url": this.$localStorage.get('cors_proxy')+"/"+this.$localStorage.get('led_ip')+"/light/3d_drucker_led/toggle" }).then(result => {
        this.getLightState();
      }, error => {
        console.error(error);
      });
    },
    getLightState: function() {
      if(this.$localStorage.get('lighthandling') == "yes") {
        axios({ method: "GET", "url": this.$localStorage.get('cors_proxy')+"/"+this.$localStorage.get('led_ip')+"/light/3d_drucker_led/state" }).then(result => {
          this.$store.state.lightState = result.data.state.toLowerCase();
          if(this.lightState == "off") {
            this.$store.state.isNotLight = true;
            this.$store.state.isLight = false;
          } else {
            this.$store.state.isNotLight = false;
            this.$store.state.isLight = true;
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
        this.$store.state.isNotConnection = false;
        this.$store.state.isConnection = true;
        this.$store.state.isConnecting = true;
        this.$store.state.connectionState = "...";
      }, error => {
          console.error(error);
      });
    },
    loadCam: function() {
      var self = this;
      axios({ method: "GET", "url": this.$localStorage.get('octo_ip')+"/api/settings", headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
        this.$store.state.cam = result.data.webcam.streamUrl;
      }, error => {
          console.error(error);
      });
    },
    getOctoprintConnection: function() {
      var self = this;
      axios({ method: "GET", "url": this.$localStorage.get('octo_ip')+"/api/connection", headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
        self.$store.state.connectionSettings = result.data;
        console.log(result.data);
        self.$store.state.pageLoader = false;
      }, error => {
          self.displayMsg('octoprint_conn_error');
          console.error(error);
          if(self.$store.state.octoprintConnectionTries < self.$store.state.octoprintConnectionMaxTries) {
            setTimeout(function(){
              self.$store.state.octoprintConnectionTries = self.$store.state.octoprintConnectionTries + 1;
              self.getOctoprintConnection();
            }, 1000);
          } else {
            this.$store.state.pageLoaderAddText = "Connection failed, seems like OctoPrint server is not available!?";
          }
      });
    },
    changeFileSource: function(src) {
      this.$store.state.file_origin = src;
      this.loadFiles();
    },
    selectFolder: function(path) {
      this.$store.state.selectedfolder = path;
      this.listFiles();
    },
    folderup: function() {
      this.$store.state.selectedfolder = this.$store.state.selectedfolder.substring(0, this.$store.state.selectedfolder.lastIndexOf('/'));
      this.listFiles();
    },
    selectFile: function(event, file) {
      this.$store.state.selectedfile = file;
      var imgid = file.display.replace(".", "");
      $("#filestable tr").removeClass("is-selected");
      $(".file_buttons span").css("display", "none");
      $(event.srcElement.parentElement).addClass("is-selected");      
      $("#fb_"+imgid+" span").css("display", "block");
      $("#fb_"+imgid+" span").removeAttr("disabled");
      $("#fileoperations span").removeAttr("disabled");
      $('#btn_cancel').attr("disabled", true);
    },
    loadFiles: function() {
      axios({ method: "GET", "url": this.$localStorage.get('octo_ip')+"/api/files?recursive=true", headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
        this.$store.state.fileList = [];
        this.$store.state.fileList = result.data.files;
        this.listFiles();
        this.getStats();
      }, error => {
          console.error(error);
      });
    },
    imgFallback(event) {
      event.target.src = "img/placeholder.png"
    },
    listFiles: function() {
      var self = this;

      this.$store.selectedfile = "";
      $("#filestable tr").removeClass("is-selected");
      $(".file_buttons span").css("display", "none");
      this.$store.state.files = [];
      this.$store.state.folders = [];

      var path = this.selectedfolder.split("/");
      var pathobj;
      if(this.$store.state.selectedfolder.length > 0 && path[0] != "") { // Subfolder
        for(var i = 0; i<this.$store.state.fileList.length;i++) {
          if(this.$store.state.fileList[i].path == path[0]) {
            pathobj = this.$store.state.fileList[i];
          }
        }
        if(path.length > 1) {
          for(var n=1;n<path.length;n++) {
            for(var m=0;m<pathobj.children.length;m++) {
              if(pathobj.children[m].path == this.$store.state.selectedfolder) {
                pathobj = pathobj.children[m];
              }
            }
          }
        }
        var date;
        var tstamp;
        var day;
        var month;
        var imgid;
        var img;
        var download;
        var i;
        if(pathobj.children.length > 0) {
          for(i = 0; i<pathobj.children.length;i++) {
            if(pathobj.children[i].type == "folder") {
              this.$store.state.folders.push(pathobj.children[i]);
            } else if(pathobj.children[i].type == "machinecode") {
              if(pathobj.children[i].refs.resource != null) {
                if(self.file_origin == "local" && pathobj.children[i].refs.resource.includes(".gcode")) {
                  img = pathobj.children[i].refs.download.replace(".gcode", ".png");
                  download = pathobj.children[i].refs.download;
                }

                if(self.file_origin == "sdcard" && pathobj.children[i].refs.resource.includes(".gco")) {
                  img = pathobj.children[i].refs.resource.replace(".gco", ".png");
                  download = pathobj.children[i].refs.resource;
                }
                imgid = pathobj.children[i].display.replace(".", "");

                if(pathobj.children[i].date != null) {
                  tstamp = new Date(pathobj.children[i].date*1000);
                  day = "0"+tstamp.getDate();
                  month = "0"+tstamp.getMonth();
                  date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                } else {
                  date = "";
                }
                pathobj.children[i].download = download;
                pathobj.children[i].img = img;
                pathobj.children[i].imgid = imgid;
                pathobj.children[i].thumbid = "thumb_"+imgid;
                pathobj.children[i].hr_date = date;
                if(pathobj.children[i].gcodeAnalysis == null) {
                  pathobj.children[i].gcodeAnalysis = {};
                  pathobj.children[i].gcodeAnalysis.estimatedPrintTime = null;
                  pathobj.children[i].gcodeAnalysis.filament = {"tool0": {"length": null, "volume": null}};
                  pathobj.children[i].gcodeAnalysis.printingArea = {"maxX": null, "maxY": null, "maxZ": null, "minX": null, "minY": null, "minZ": null};
                }
                if(pathobj.children[i].gcodeAnalysis.dimensions == null) {
                  pathobj.children[i].gcodeAnalysis.dimensions = {"width": null, "depth": null, "height": null};
                }
              }
              this.$store.state.files.push(pathobj.children[i]);
            }
          }
        }
      } else { // Main folder
        for (i = 0; i < this.$store.state.fileList.length; i++) {
          if(this.$store.state.fileList[i].origin == this.file_origin) {
            if(this.$store.state.fileList[i].type == "folder") {
              self.folders.push(this.fileList[i]);
            } else if(this.$store.state.fileList[i].type == "machinecode") {
              if(this.$store.state.fileList[i].refs.resource != null) {
                if(self.file_origin == "local" && this.$store.state.fileList[i].refs.resource.includes(".gcode")) {
                  img = this.$store.state.fileList[i].refs.download.replace(".gcode", ".png");
                  download = this.$store.state.fileList[i].refs.download;
                }

                if(self.file_origin == "sdcard" && this.fileList[i].refs.resource.includes(".gco")) {
                  img = this.$store.state.fileList[i].refs.resource.replace(".gco", ".png");
                  download = this.$store.state.fileList[i].refs.resource;
                }
                imgid = this.$store.state.fileList[i].display.replace(".", "");
                if(this.fileList[i].date != null) {
                  tstamp = new Date(this.$store.state.fileList[i].date*1000);
                  day = "0"+tstamp.getDate();
                  month = "0"+tstamp.getMonth();
                  date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                } else {
                  date = "";
                }
                this.$store.state.fileList[i].download = download;
                this.$store.state.fileList[i].img = img;
                this.$store.state.fileList[i].imgid = imgid;
                this.$store.state.fileList[i].thumbid = "thumb_"+imgid;
                this.$store.state.fileList[i].hr_date = date;
                if(this.$store.state.fileList[i].gcodeAnalysis == null) {
                  this.$store.state.fileList[i].gcodeAnalysis = {};
                  this.$store.state.fileList[i].gcodeAnalysis.estimatedPrintTime = null;
                  this.$store.state.fileList[i].gcodeAnalysis.filament = {"tool0": {"length": null, "volume": null}};
                  this.$store.state.fileList[i].gcodeAnalysis.printingArea = {"maxX": null, "maxY": null, "maxZ": null, "minX": null, "minY": null, "minZ": null};
                }
                if(this.$store.state.fileList[i].gcodeAnalysis.dimensions == null) {
                  this.$store.state.fileList[i].gcodeAnalysis.dimensions = {"width": null, "depth": null, "height": null};
                }
              }
              this.$store.state.files.push(this.fileList[i]);
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
    loadprintFile: function(print) {
      var url = this.$localStorage.get('octo_ip')+"/api/files/"+this.$store.state.selectedfile.origin+"/"+this.$store.state.selectedfile.display;
      var obj = {};
      obj.command = "select";
      obj.print = print;

      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        if(print) {
          $('#btn_cancel').attr("disabled", false);
          this.$router.push('printpage')
        }
      }, error => {
          console.error(error);
      });
      /*
            axios.post(url, JSON.stringify(obj), { headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
              if(print) {
                $('#btn_cancel').attr("disabled", false);
              }
            }, error => {
                console.error(error);
            });
      */
    },
    deleteFile: function() {
      var url = "";
      if(this.$store.state.selectedfolder == "") {
        url = this.$localStorage.get('octo_ip')+"/api/files/local/"+this.$store.state.selectedfile.display;
      } else {
        url = this.$localStorage.get('octo_ip')+"/api/files/local/"+this.$store.state.selectedfolder+"/"+this.$store.state.selectedfile.display;
      }
      axios({ method: "DELETE", "url": url, headers: {'X-Api-Key': this.$localStorage.get('apikey')} }).then(result => {
        this.$store.state.selectedfile = null;
        $("#fileoperations span").attr("disabled", true);
        this.loadFiles();
      }, error => {
          console.error(error);
      });
    },
    cancelJob: function() {
      var url = this.$localStorage.get('octo_ip')+"/api/job";
      var obj = {};
      obj.command = "cancel";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        $('#btn_cancel').attr("disabled", true);
      }, error => {
          console.error(error);
      });
    },
    pauseJob: function() {
      var url = this.$localStorage.get('octo_ip')+"/api/job";
      var obj = {};
      obj.command = "pause";
      obj.action = "pause";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    },
    resumeJob: function() {
      var url = this.$localStorage.get('octo_ip')+"/api/job";
      var obj = {};
      obj.command = "pause";
      obj.action = "resume";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    },
    setExtruderTemp: function() {
      var temp = $("#sliderExtruder").val();
      var url = this.$localStorage.get('octo_ip')+"/api/printer/tool";
      var obj = {};
      obj.command = "target";
      obj.targets = {};
      obj.targets.tool0 = parseInt(temp);
      this.temps.tool0.target = temp;
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        var temptool0_ist = (100/temp)*this.$store.state.temps.tool0.actual;
        $("#temp_tool0_actual").css("height", temptool0_ist+"%");
      }, error => {
          console.error(error);
      });
    },
    setBedTemp: function() {
      var temp = $("#sliderBed").val();
      var url = this.$localStorage.get('octo_ip')+"/api/printer/bed";
      var obj = {};
      obj.command = "target";
      obj.target = parseInt(temp);
      this.$store.state.temps.bed.target = temp;
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        var tempbed_ist = (100/temp)*this.$store.state.temps.bed.actual;
        $("#temp_bed_actual").css("height", tempbed_ist+"%");
      }, error => {
          console.error(error);
      });
    },
    pcmds: function(gcmd) {
      var url = this.$localStorage.get('octo_ip')+"/api/printer/command";
      var obj = {};
      obj.command = gcmd;
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$localStorage.get('apikey'), 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then({
      }, error => {
          console.error(error);
      });
    },
    windowOpen: function(url) {
      window.open(url, "_blank"); 
    },
    thingiverse_search: function() {
      this.$store.state.searchLoader = true;
      var url;
      var q;
      if(this.$store.state.q == "") {
        q = this.$store.state.q.replace(" ", "%2B");
        url = "http://cststudios.de/thingiverse/?action=init";
        axios({ method: "GET", url: url}).then(result => {
          this.$store.state.thingiverse_results = result.data;
          this.$store.state.searchLoader = false;
        }, error => {
            console.error(error);
            this.$store.state.searchLoader = false;
        });
      } else {
        q = this.$store.state.q.replace(" ", "%2B");
        url = "http://cststudios.de/thingiverse/?action=search&q="+q+"&page="+this.$store.state.thingpage;
        axios({ method: "GET", url: url}).then(result => {
          this.$store.state.thingiverse_results = result.data;
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
      this.thingpage = this.$store.state.thingpage -1;
    },
    nextPage: function() {
      this.thingpage = this.$store.state.thingpage +1;
    },
    nav: function(page) {
      this.$store.state.page = page;
    },
    updateGauge: function(tool0temp, bedtemp) {
      var tool0temp_percent = (100/250)*parseInt(tool0temp);
      var bedtemp_percent = (100/90)*parseInt(bedtemp);
      this.$store.state.pie_tool0.datasets[0].data = [tool0temp_percent, 100-tool0temp_percent];
      this.$store.state.pie_bed.datasets[0].data = [bedtemp_percent, 100-bedtemp_percent];
      /*if(this.$refs.tool0chart) {
        this.$refs.tool0chart.chart.update();
        this.$refs.bedchart.chart.update();
      }
      */
    },
    updateTempChart: function(tool0_ist, tool0_soll, bed_ist, bed_soll) {
      this.$store.state.line_temps.datasets[0].data.push({x:this.$store.state.line_temps.datasets[0].data.length+1, y:parseInt(tool0_ist)});
      this.$store.state.line_temps.datasets[1].data.push({x:this.$store.state.line_temps.datasets[1].data.length+1, y:parseInt(tool0_soll)});
      this.$store.state.line_temps.datasets[2].data.push({x:this.$store.state.line_temps.datasets[2].data.length+1, y:parseInt(bed_ist)});
      this.$store.state.line_temps.datasets[3].data.push({x:this.$store.state.line_temps.datasets[3].data.length+1, y:parseInt(bed_soll)});
      this.$store.state.line_temps.labels.push('');
      /*if(this.$refs.tempchart) {
        this.$refs.tempchart.chart.update();
      }*/
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
        default:
          console.log("unhandled msg error");
      }
    },
    getStats: function() {
      var s = 0;
      var f = 0;
      var img;
      var imgid;
      for(var i = 0; i<this.$store.state.fileList.length;i++) {
        var obj = this.$store.state.fileList[i];
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
    configFromFile: function() {
      if(this.$localStorage.get('octo_ip') == null || this.$localStorage.get('apikey') == null) {
        axios({ method: "GET", url: window.location.href+"/octovue_config.txt"}).then(result => {
          if(result.status == 200) {
            console.log("configfile result: "+result);
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
            if(config.lighthandling) {
              this.$localStorage.set('lighthandling', 'yes');
            } else {
              this.$localStorage.set('lighthandling', 'no');
            }
            this.$localStorage.set('led_ip', config.led_ip);
            this.$localStorage.set('cors_proxy', config.cors_proxy);
            this.$router.go();
          }
        }, error => {
            console.error(error);
        });
      }
    }
  },
  computed: {
    ...mapState([
      'temp',
      'page',
      'infomodal',
      'terminalmodal',
      'settingsmodal',
      'printerState',
      'temps',
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
      'selectedfolder',
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
      'pie_stats_printing_options'
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