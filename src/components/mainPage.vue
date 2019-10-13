<template>
  <div class="hello">
    <div id="dropzoneProgress">
      <div class="imgContainer"><img src="img/upload.gif"></div>
      <div class="textContainer"><h3>uploading...</h3></div>
    </div>
    <article id="messagebox" class="message is-danger">
      <div id="messagebox_body" class="message-body"></div>
    </article>

    <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="https://bulma.io">
            <!-- <img src="https://bulma.io/images/bulma-logo.png" alt="Bulma: Free, open source, & modern CSS framework based on Flexbox" width="112" height="28"> !-->
            Octo^^in
          </a>
        </div>
        <div id="navbarBasicExample" class="navbar-menu">
          <div class="navbar-start" style="width: 50%;">
            <div id="meta" class="field is-grouped is-grouped-multiline" style="margin: 14px 0px 0px 20%;">
              <div class="control" id="control_power">
                <div class="tags has-addons">
                  <span class="tag">Power</span>
                  <a class="tag" :class="{'is-success': isPower, 'is-danger': isNotPower}" id="tag_printer_power" v-on:click="powerswitch">{{ powerState }}</a>
                </div>
              </div>

              <div class="control">
                <div class="tags has-addons">
                  <span class="tag">Connection</span>
                  <a class="tag" :class="{'is-success': isConnection, 'is-danger': isNotConnection, 'is-warning': isConnecting}" id="tag_btn_connect" v-on:click="printerConnection()">{{ connectionState }}</a>
                </div>
              </div>

              <div class="control" id="control_light">
                <div class="tags has-addons">
                  <span class="tag">Light</span>
                  <a class="tag" :class="{'is-success': isLight, 'is-danger': isNotLight}" id="tag_lightswitch" v-on:click="lightswitch">{{ lightState }}</a>
                </div>
              </div>
            </div>
          </div>
          <div class="navbar-end">
            <div class="navbar-item">
              <div class="buttons">
                <a class="button is-info is-small" v-on:click="terminalmodal = !terminalmodal">Terminal</a>
                <a class="button is-info is-small" v-on:click="infomodal = !infomodal">Info</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="modal" v-bind:class="{ 'is-active' : infomodal }">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Usage Information</p>
            <button class="delete" aria-label="close" v-on:click="infomodal = !infomodal"></button>
          </header>
          <section class="modal-card-body">
            <div class="content">
              <h3>General</h3>
              <p>Octoprint installation is required for octo^^in to work and control your printer. Just edit &quot;main.js&quot;, set &quot;Vue.prototype.$octo_ip&quot; to your octoprint ipaddress:port and set &quot;Vue.prototype.$apikey&quot; to your octoprint's api key.</p>
              <h3>Uploading files</h3>
              <p>Navigate to the destination folder and just drag and drop the gcode file into this browser window.<br />For now, only uploading to octoprint's local storage is used.</p>
              <h3>Printer power</h3>
              <p>For switching the printer on/off I use a &quot;Sonoff POW with tasmota firmware&quot;. If you plan the same/similar setup, edit &quot;main.js&quot;, set your sonoff's ip-address and set &quot;Vue.prototype.$powerhandling = yes&quot;.</p>
              <h3>Light control</h3>
              <p>For switching the enclosure lights on/off I use a &quot;nodemcu flashed with esphome&quot;, integrated into homeassistant. If you plan the same/similar setup, edit &quot;main.js&quot;, set your led-controlling-device's ip-address and set &quot;Vue.prototype.$lighthandling = yes&quot;.</p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button" v-on:click="infomodal = !infomodal">Got it</button>
          </footer>
        </div>
      </div>
      <transition name="fade" mode="out-in">
        <div id="terminal" v-if="terminalmodal">
          <div id="terminal_header">
            <div style="width: 96%; float: left;">Terminal</div>
            <button class="delete" aria-label="close" v-on:click="terminalmodal = !terminalmodal" style=""></button>
          </div>
          <div class="field">
            <div class="control">
              <textarea id="terminal_console" class="textarea is-warning" placeholder="" v-model="terminalLogs"></textarea>
            </div>
          </div>
        </div>
      </transition>

      <section class="section">
        <div class="container">

          <div class="columns">

            <div class="column is-three-quarters">
              <h2>Files & Folders</h2>
                <table id="filebrowser_head" class="table is-fullwidth">
                  <thead>
                    <tr colspan="3">
                    <td>
                      <div class="tabs is-centered is-boxed">
                        <ul>
                          <li id="tab_local" v-bind:class="{ 'is-active' : file_origin == 'local' }"><a v-on:click="changeFileSource('local')"> <i class="fas fa-hdd"></i>&nbsp;local</a></li>
                          <li id="tab_sdcard" v-bind:class="{ 'is-active' : file_origin == 'sdcard' }"><a v-on:click="changeFileSource('sdcard')"><i class="fas fa-sd-card"></i>&nbsp;sdcard</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                      <td colspan="3">
                        <div class="columns">
                          <div class="column">
                            <div class="buttons" id="fileoperations" v-if="selectedfile != ''">
                              <span id="btn_load" class="button is-warning" disabled v-on:click="loadprintFile(false)">load</span>
                              <span id="btn_print" class="button is-success" disabled v-on:click="loadprintFile(true)">print</span>
                              <span id="btn_delete" class="button is-danger" disabled v-on:click="deleteFile()">delete</span>
                            </div>
                          </div>
                          <div class="is-divider-vertical" data-content="OR"></div>
                          <div class="column">
                            <div class="buttons" id="fileoperations" v-if="printerState.payload.state_string == 'Printing'">
                              <span id="btn_pause" class="button is-warning"  v-on:click="pauseJob()">pause print</span>
                              <span id="btn_resume" class="button is-success"  v-on:click="resumeJob()">resume print</span>
                              <span id="btn_cancel" class="button is-danger"  v-on:click="cancelJob()">cancel print</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                </tbody>
              </table>
              <div v-if="selectedfolder != ''" v-on:click="folderup()" style="text-align: left">&#x2190; back</div>
              <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
                <tbody id="filesbody">
                  <tr v-on:click="selectFolder(folder.path)" v-for="folder in folders"><td><span class="icon">&#128193;</span></td><td>{{ folder.display }}</td><td></td></tr>
                  <tr v-on:click="selectFile($event, file)" v-for="file in files"><td><figure class="image is-128x128"><img :src="file.img" :id="file.thumbid" class="thumb" @error="imgFallback" v-on:mousemove="zoomIn($event, file.imgid)" v-on:mouseleave="zoomOut(''+file.imgid)"></figure><div class="overlay_wrapper"><div :id="'overlay_'+file.imgid" class="zoomoverlay" v-bind:style="{'background-image': 'url(' + file.img + ')' }"></div></div></td><td>{{ file.display }}</td><td>{{file.hr_date}} <div class="file_buttons" :id="'fb_'+file.imgid"><span id="btn_load" class="button is-warning is-small" disabled v-on:click="loadprintFile(false)">load</span> <span id="btn_print" class="button is-success is-small" disabled v-on:click="loadprintFile(true)">print</span> <span id="btn_delete" class="button is-danger is-small" disabled v-on:click="deleteFile()">delete</span></div></td></tr>
                </tbody>
              </table>
            </div>


            <div class="column">

            <div class="card">
              <div class="card-image">
                <figure class="image is-4by3">
                  <img :src="cam"  @error="imgFallback" alt="Printer image">
                </figure>
              </div>
              <div class="card-content">
                <div class="media">

                  <div class="media-content">
                    <p class="title is-4" id="printername"></p>
                    <p class="subtitle is-6" id="connectionstatus">{{ printerState.payload.state_string }}</p>
                  </div>
                </div>

                <div class="content" id="cardprinterstatus">
                  <p>Tool-0 Temp: <span id="tool0tempactual">{{ temps.tool0.actual }}</span>&deg; C / <span id="tool0temptarget">{{ temps.tool0.target }}</span>&deg; C</p>
                  <p>Bed Temp: <span id="bedtempactual">{{ temps.bed.actual }}</span>&deg; C / <span id="bedtemptarget">{{ temps.bed.target }}</span>&deg; C</p>
                </div>

                <div class="content" id="cardtools" style="border-top: 1px solid #C0C0C0; height: 270px;" v-if="printerState.payload.state_string != 'Offline'">
                <div style="width: 25%; float: left; text-align: center;">
                  <p>Extruder:</p>
                  <input id="sliderExtruder" class="slider is-fullwidth is-danger is-small is-circle has-output" step="1" min="0" max="250" v-bind:value="temps.tool0.target" type="range" orient="vertical" v-on:mouseup="setExtruderTemp()"><output id="sliderextruderoutput" for="sliderExtruder">{{ temps.tool0.target }}</output> &deg;C
                </div>
                <div style="width: 25%; float: left; text-align: center;">
                  <p>&nbsp;</p>
                  <div class="temp_ist"><div id="temp_tool0_actual"></div></div>
                </div>
                <div style="width: 25%; float: left; text-align: center;">
                  <p>Bed:</p>
                  <input id="sliderBed" class="slider is-fullwidth is-info is-small is-circle has-output" step="1" min="0" max="90" v-bind:value="temps.bed.target" type="range" orient="vertical" v-on:mouseup="setBedTemp()"><output id="sliderbedoutput" for="sliderBed">{{temps.bed.target}}</output> &deg;C
                </div>
                <div style="width: 25%; float: left; text-align: center;">
                  <p>&nbsp;</p>
                  <div class="temp_ist"><div id="temp_bed_actual"></div></div>
                </div>

                <div class="dropdown is-hoverable is-up" style="margin: 20px 0px 0px 0px;">
                  <div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu4">
                      <span>Printer commands</span>

                      <span class="icon is-small">
                        <i class="fas fa-angle-up" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div class="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                      <div class="dropdown-item" id="dropdown-item_printer_commands">
                        <a v-for="value in $gcodes[$printer_firmware]" class="dropdown-item" v-bind:data-id="value.cmd" v-on:click="pcmds(value.gcmd)"><i class="fas" v-bind:class="value.icon"></i> {{ value.label }}</a>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>OctoVue</strong>
          <a href="https://github.com/shodushi/octovue" target="_blank"> -&gt; GitHub</a>
        </p>
        </div>
      </footer>







  </div>
</template>

<script>
import axios from "axios";

import * as SockJS from 'sockjs-client';
var StompJs = require('@stomp/stompjs');
import jQuery from 'jquery';

export default {
  name: 'mainPage',
  props: {
    msg: String,
    txt: String
  },
  created:function(){
    
  },
  mounted:function() {
    setTimeout(this.loadCam, 500)
    setTimeout(this.getPowerState, 1)
    setTimeout(this.getLightState, 1)
    setTimeout(this.loadFiles, 1)
    
    if(this.printerState.payload.state_string != "Operational") {
      this.isNotConnection = true;
      this.isConnection = false;
      this.isConnecting = false;
      this.connectionState = "off";
    } else if(self.printerState.payload.state_string == "Connecting") {
      this.isNotConnection = false;
      this.isConnection = true;
      this.isConnecting = true;
      this.connectionState = "...";
    } else {
      this.isNotConnection = false;
      this.isConnection = true;
      this.isConnecting = false;
      this.connectionState = "on";
    }
    var self = this;
    var sock = new SockJS('http://192.168.120.244:5000/sockjs');
    console.log("1");
    const client = new StompJs.Client({
      brokerURL: "ws://192.168.120.244:5000/sockjs",
      debug: function (data) {
          console.log(data);
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });
    console.log("2");
    client.webSocketFactory = function () {
      sock = new SockJS('http://192.168.120.244:5000/sockjs');
    };
    client.onConnect = function(frame) {
      //console.log(frame.data);
    };
    client.onStompError = function (frame) {
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    };
    sock.onmessage = function(e) {
      messageParser(e.data);
      sock.close();
    };
    console.log("3");
    client.activate();
    console.log("4");

//-----------------------------------------------------------------------------------------
    var messageParser = function(msg) {
      console.log(msg);
      if(msg.event != null) {
          if(msg.event.type != null) {
              if(msg.event.type == "PrinterStateChanged") {
                  self.printerState = msg.event;
                  if(self.printerState.payload.state_string != "Operational" && self.printerState.payload.state_string != "Connecting") {
                    self.isNotConnection = true;
                    self.isConnection = false;
                    self.isConnecting = false;
                    self.connectionState = "off";
                  } else if(self.printerState.payload.state_string == "Connecting") {
                    self.isNotConnection = false;
                    self.isConnection = true;
                    self.isConnecting = true;
                    self.connectionState = "...";
                  } else {
                    self.isNotConnection = false;
                    self.isConnection = true;
                    self.isConnecting = false;
                    self.connectionState = "on";
                  }
              }
              if(msg.event.type == "UpdatedFiles") {
                  self.loadFiles();
              }
          }
      }
      if(msg.current != null) {
        if(msg.current.temps != null) {
          if(msg.current.temps.length != 0) {
            if(msg.current.temps[0].tool0 != null) {
              self.temps = msg.current.temps[0];
              var temptool0_ist = (100/self.temps.tool0.target)*self.temps.tool0.actual;
              $("#temp_tool0_actual").css("height", temptool0_ist+"%");
              var tempbed_ist = (100/self.temps.bed.target)*self.temps.bed.actual;
              $("#temp_bed_actual").css("height", tempbed_ist+"%");
            }
          }
        }
        if(msg.current.logs != null) {
          for(var i=0;i<msg.current.logs.length;i++) {
            self.logs.push(msg.current.logs[i])
          }
        }
        if(msg.current.state != null) {
          self.printerState.payload.state_string = msg.current.state.text;
          if(self.printerState.payload.state_string != "Operational") {
            self.isNotConnection = true;
            self.isConnection = false;
            self.isConnecting = false;
            self.connectionState = "off";
          } else if(self.printerState.payload.state_string == "Connecting") {
            self.isNotConnection = false;
            self.isConnection = true;
            self.isConnecting = true;
            self.connectionState = "...";
          } else {
            self.isNotConnection = false;
            self.isConnection = true;
            self.isConnecting = false;
            self.connectionState = "on";
          }
        }

      }
      if(msg.history != null) {
        if(msg.history.logs != null) {
          if(msg.history.logs.length != 0) {
            self.logs = msg.history.logs
          }
        }
        if(msg.history.temps != null) {
          if(msg.history.temps.length > 0) {
            //self.temps = msg.history.temps[msg.history.temps.length-1]
          }
        }
        if(msg.history.state != null) {
          self.printerState = {"type": "PrinterStateChanged", "payload":{"state_string": msg.history.state.text,"state_id":""}}
        }
      }
    }
//-----------------------------------------------------------------------------------------
  },
  data() {
    return {
      infomodal: false,
      terminalmodal: false,
      printerState: {"type": "PrinterStateChanged", "payload":{"state_string":"Offline","state_id":"OFFLINE"}},
      temps: {"bed":{"actual":"0","target":"0"}, "chamber":{"actual":"0","target":"0"}, "tool0":{"actual":"0","target":"0"}, "time": "0"},
      logs: {},
      cam: "",
      powerState: "off",
      lightState: "off",
      connectionState: "off",
      isPower: false,
      isNotPower: true,
      isLight: false,
      isNotLight: true,
      isConnection: false,
      isNotConnection: true,
      isConnecting: false,
      fileList: [],
      selectedfolder: "",
      selectedfile: "",
      files: [],
      folders: [],
      file_origin: "local",
      files: [],
      folders: []
    }
  },
  methods: {
    handleClick: function() {
      axios({ method: "GET", "url": this.$octo_ip+"/api/settings", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        this.cam = ""+result.data.webcam.streamUrl;
      }, error => {
          console.error(error);
      });
    },
    powerswitch: function() {
      axios({ method: "GET", "url": this.$cors_proxy+"/"+this.$tasmota_ip+"/cm?cmnd=Power%20TOGGLE" }).then(result => {
        this.powerState = result.data.POWER.toLowerCase();
        if(this.powerState == "off") {
          this.isNotPower = true;
          this.isPower = false;
        } else {
          this.isNotPower = false;
          this.isPower = true;
        }
      }, error => {
          console.error(error);
      });
    },
    getPowerState: function() {
      axios({ method: "GET", "url": this.$cors_proxy+"/"+this.$tasmota_ip+"/cm?cmnd=Status" }).then(result => {
        if(result.data.Status.Power == 0) {
          this.powerState = "off";
          this.isNotPower = true;
          this.isPower = false;
        } else {
          this.powerState = "on";
          this.isNotPower = false;
          this.isPower = true;
        }

      }, error => {
          console.error(error);
      });
    },
    lightswitch: function() {
      axios({ method: "POST", "url": this.$cors_proxy+"/"+this.$led_ip+"/light/3d_drucker_led/toggle" }).then(result => {
	      this.getLightState();
      }, error => {
          console.error(error);
      });
      
    },
    getLightState: function() {
      axios({ method: "GET", "url": this.$cors_proxy+"/"+this.$led_ip+"/light/3d_drucker_led/state" }).then(result => {
        this.lightState = result.data.state.toLowerCase();
        if(this.lightState == "off") {
          this.isNotLight = true;
          this.isLight = false;
        } else {
          this.isNotLight = false;
          this.isLight = true;
        }
      }, error => {
          console.error(error);
      });
    },
    printerConnection: function() {
      var obj = {};
      if(this.isNotConnection) {
        obj.command = "connect";
        obj.port = "/dev/ttyACM0";
        obj.baudrate = 115200;
        obj.printerProfile = "_default";
        obj.save = true;
        obj.autoconnect = false;
      } else {
        obj.command = "disconnect";
      }
      axios({ method: "POST", url: this.$octo_ip+"/api/connection", headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    },
    loadCam: function() {
      var self = this;
      axios({ method: "GET", "url": this.$octo_ip+"/api/settings", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        self.cam = result.data.webcam.streamUrl;
      }, error => {
          console.error(error);
      });
    },
    changeFileSource: function(src) {
      this.file_origin = src;
      this.loadFiles();
    },
    selectFolder: function(path) {
      this.selectedfolder = path;
      this.listFiles();
    },
    folderup: function() {
      this.selectedfolder = this.selectedfolder.substring(0, this.selectedfolder.lastIndexOf('/'))
	    this.listFiles();
    },
    selectFile: function(event, file) {
      this.selectedfile = file;
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
      var self = this;
      axios({ method: "GET", "url": this.$octo_ip+"/api/files?recursive=true", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        this.fileList = [];
        this.fileList = result.data.files;
        console.log(result.data.files);
        this.listFiles();
      }, error => {
          console.error(error);
      });
    },
    imgFallback(event) {
      event.target.src = "img/placeholder.png"
    },
    listFiles: function() {
      var self = this;
      this.files = [];
      this.folders = [];

      var path = this.selectedfolder.split("/");
      var pathobj;
      if(this.selectedfolder.length > 0 && path[0] != "") { // Subfolder
        for(var i = 0; i<this.fileList.length;i++) {
          if(this.fileList[i].path == path[0]) {
            pathobj = this.fileList[i];
          }
        }
        if(path.length > 1) {
          for(n=1;n<path.length;n++) {
            for(m=0;m<pathobj.children.length;m++) {
              if(pathobj.children[m].path == selectedfolder) {
                pathobj = pathobj.children[m];
              }
            }
          }
        }
        if(pathobj.children.length > 0) {
          for(var i = 0; i<pathobj.children.length;i++) {
            if(pathobj.children[i].type == "folder") {
              this.folders.push(this.fileList[i]);
            } else {
              var img;
              var download;
              if(pathobj.children[i].refs.resource != null) {
                if(self.file_origin == "local" && pathobj.children[i].refs.resource.includes(".gcode")) {
                  img = pathobj.children[i].refs.download.replace(".gcode", ".png");
                  download = pathobj.children[i].refs.download;
                }

                if(self.file_origin == "sdcard" && pathobj.children[i].refs.resource.includes(".gco")) {
                  img = pathobj.children[i].refs.resource.replace(".gco", ".png");
                  download = pathobj.children[i].refs.resource;
                }
                var imgid = pathobj.children[i].display.replace(".", "");

                if(pathobj.children[i].date != null) {
                  var tstamp = new Date(pathobj.children[i].date*1000);
                  var day = "0"+tstamp.getDate();
                  var month = "0"+tstamp.getMonth();
                  var date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                } else {
                  var date = "";
                }
                pathobj.children[i].download = download;
                pathobj.children[i].img = img;
                pathobj.children[i].imgid = imgid;
                pathobj.children[i].thumbid = "thumb_"+imgid;
                pathobj.children[i].hr_date = date;
              }
              this.files.push(pathobj.children[i]);
            }
          }
        }
      } else { // Main folder
        for (i = 0; i < this.fileList.length; i++) {
          if(this.fileList[i].origin == this.file_origin) {
            if(this.fileList[i].type == "folder") {
              self.folders.push(this.fileList[i]);
            } else {
              var img;
              var download;
              if(this.fileList[i].refs.resource != null) {
                if(self.file_origin == "local" && this.fileList[i].refs.resource.includes(".gcode")) {
                  img = this.fileList[i].refs.download.replace(".gcode", ".png");
                  download = this.fileList[i].refs.download;
                }

                if(self.file_origin == "sdcard" && this.fileList[i].refs.resource.includes(".gco")) {
                  img = this.fileList[i].refs.resource.replace(".gco", ".png");
                  download = this.fileList[i].refs.resource;
                }
                var imgid = this.fileList[i].display.replace(".", "");

                if(this.fileList[i].date != null) {
                  var tstamp = new Date(this.fileList[i].date*1000);
                  var day = "0"+tstamp.getDate();
                  var month = "0"+tstamp.getMonth();
                  var date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                } else {
                  var date = "";
                }
                this.fileList[i].download = download;
                this.fileList[i].img = img;
                this.fileList[i].imgid = imgid;
                this.fileList[i].thumbid = "thumb_"+imgid;
                this.fileList[i].hr_date = date;
              }
              this.files.push(this.fileList[i]);
            }
          }
        }
      }
    },
    zoomIn: function(event, id) {
      var element = document.getElementById("overlay_"+id);
      element.style.display = "inline-block";
      var img = document.getElementById("imgZoom");
      var posX = event.offsetX ? (event.offsetX) : event.pageX - img.offsetLeft;
      var posY = event.offsetY ? (event.offsetY) : event.pageY - img.offsetTop;
      element.style.backgroundPosition=(-posX*3.5)+"px "+(-posY*4)+"px";
    },
    zoomOut: function(id) {
      var element = document.getElementById("overlay_"+id);
      element.style.display = "none";
    },
    loadprintFile: function(print) {
      var url = this.$octo_ip+"/api/files/"+this.selectedfile.origin+"/"+this.selectedfile.display;
      var obj = {};
      obj.command = "select";
      obj.print = print;

      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        if(print) {
          $('#btn_cancel').attr("disabled", false);
        }
      }, error => {
          console.error(error);
      });
      /*
            axios.post(url, JSON.stringify(obj), { headers: {'X-Api-Key': this.$apikey} }).then(result => {
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
      if(this.selectedfolder == "") {
        url = this.$octo_ip+"/api/files/local/"+this.selectedfile.display;
      } else {
        url = this.$octo_ip+"/api/files/local/"+this.selectedfolder+"/"+this.selectedfile.display;
      }
      axios({ method: "DELETE", "url": url, headers: {'X-Api-Key': this.$apikey} }).then(result => {
        this.selectedfile = null;
        $("#fileoperations span").attr("disabled", true);
        this.loadFiles();
        console.log(result);
      }, error => {
          console.error(error);
      });
    },
    cancelJob: function() {
      var url = this.$octo_ip+"/api/job";
      var obj = {};
      obj.command = "cancel";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    },
    pauseJob: function() {
      var url = this.$octo_ip+"/api/job";
      var obj = {};
      obj.command = "pause";
      obj.action = "pause";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    },
    resumeJob: function() {
      var url = this.$octo_ip+"/api/job";
      var obj = {};
      obj.command = "pause";
      obj.action = "resume";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    },
    setExtruderTemp: function(temp) {
      var temp = $("#sliderExtruder").val();
      var url = this.$octo_ip+"/api/printer/tool";
      var obj = {};
      obj.command = "target";
      obj.targets = {};
      obj.targets.tool0 = parseInt(temp);
      this.temps.tool0.target = temp;
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        var temptool0_ist = (100/temp)*this.temps.tool0.actual;
        $("#temp_tool0_actual").css("height", temptool0_ist+"%");
      }, error => {
          console.error(error);
      });
    },
    setBedTemp: function() {
      var temp = $("#sliderBed").val();
      var url = this.$octo_ip+"/api/printer/bed";
      var obj = {};
      obj.command = "target";
      obj.target = parseInt(temp);
      this.temps.bed.target = temp;
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        var tempbed_ist = (100/temp)*this.temps.bed.actual;
        $("#temp_bed_actual").css("height", tempbed_ist+"%");
      }, error => {
          console.error(error);
      });
    },
    pcmds: function(gcmd) {
      var url = this.$octo_ip+"/api/printer/command";
      var obj = {};
      obj.command = gcmd;
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
      }, error => {
          console.error(error);
      });
    }
  },
  computed: {
    terminalLogs: {
      get() {
        return this.logs.join('\n')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
