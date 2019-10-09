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
                  <a class="tag" :class="{'is-success': isConnection, 'is-danger': isNotConnection}" id="tag_btn_connect" onclick="printerConnection()">{{ connectionState }}</a>
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
                <a class="button is-info is-small" v-on:click="loadFiles">Test</a>
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
              <p>Octoprint installation is required for octo^^in to work and control your printer. Just edit &quot;config.js&quot;, set &quot;octo_ip&quot; to your octoprint ipaddress:port and set &quot;apikey&quot; to your octoprint's api key.</p>
              <h3>Uploading files</h3>
              <p>Navigate to the destination folder and just drag and drop the gcode file into this browser window.<br />For now, only uploading to octoprint's local storage is used.</p>
              <h3>Printer power</h3>
              <p>For switching the printer on/off I use a &quot;Sonoff POW with tasmota firmware&quot;. If you plan the same/similar setup, edit &quot;config.js&quot;, set your sonoff's ip-address and set &quot;var powerhandling = yes&quot;.</p>
              <h3>Light control</h3>
              <p>For switching the enclosure lights on/off I use a &quot;nodemcu flashed with esphome&quot;, integrated into homeassistant. If you plan the same/similar setup, edit &quot;config.js&quot;, set your led-controlling-device's ip-address and set &quot;var lighthandling = yes&quot;.</p>
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
                          <li id="tab_local"><a onclick="browse('local')">local</a></li>
                          <li id="tab_sdcard"><a onclick="browse('sdcard')">sdcard</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                      <td colspan="3">
                    <div class="buttons" id="fileoperations">
                      <span id="btn_load" class="button is-warning" disabled onclick="loadprintFile(false)">load</span>
                      <span id="btn_print" class="button is-success" disabled onclick="loadprintFile(true)">print</span>
                      <span id="btn_cancel" class="button is-danger" disabled onclick="cancelJob()">cancel</span>
                      <span id="btn_delete" class="button is-danger" disabled onclick="deleteFile()">delete</span>
                    </div>
                      </td>
                    </tr>
                </tbody>
              </table>
              <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
                <tbody id="filesbody">
                </tbody>
              </table>
              <!--<ul id="example-1">
                <li v-repeat="file in allFiles">
                  {{ file.description }}
                </li>
              </ul>!-->
            </div>


            <div class="column">

            <div class="card">
              <div class="card-image">
                <figure class="image is-4by3">
                  <img :src="cam" alt="Printer image">
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
                  <input id="sliderExtruder" class="slider is-fullwidth is-danger is-small is-circle has-output" step="1" min="0" max="250" value="0" type="range" orient="vertical" onmouseup="setExtruderTemp(document.getElementById('sliderExtruder').value)"><output id="sliderextruderoutput" for="sliderExtruder">0</output> &deg;C
                </div>
                <div style="width: 25%; float: left; text-align: center;">
                  <p>&nbsp;</p>
                  <div class="temp_ist"><div id="temp_tool0_actual"></div></div>
                </div>
                <div style="width: 25%; float: left; text-align: center;">
                  <p>Bed:</p>
                  <input id="sliderBed" class="slider is-fullwidth is-info is-small is-circle has-output" step="1" min="0" max="90" value="0" type="range" orient="vertical" onmouseup="setBedTemp(document.getElementById('sliderBed').value)"><output id="sliderbedoutput" for="sliderBed">0</output> &deg;C
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
          <strong>Octo^^in</strong>
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
      this.connectionState = "off";
    } else {
      this.isNotConnection = false;
      this.isConnection = true;
      this.connectionState = "on";
    }
    var self = this;
    var sock = new SockJS('http://192.168.120.244:5000/sockjs');
    const client = new StompJs.Client({
        brokerURL: "ws://192.168.120.244:5000/sockjs",
        debug: function (data) {
            console.log(data);
        },
        reconnectDelay: 2000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
    });
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
    client.activate();

//-----------------------------------------------------------------------------------------
    var messageParser = function(msg) {
      console.log(msg);
      if(msg.event != null) {
          if(msg.event.type != null) {
              if(msg.event.type == "PrinterStateChanged") {
                  self.printerState = msg.event;
                  if(self.printerState.payload.state_string != "Operational") {
                    self.isNotConnection = true;
                    self.isConnection = false;
                    self.connectionState = "off";
                  } else {
                    self.isNotConnection = false;
                    self.isConnection = true;
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
            self.temps = msg.current.temps[0]
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
            self.connectionState = "off";
          } else {
            self.isNotConnection = false;
            self.isConnection = true;
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
      fileList: [],
      selectedfolder: "",
      files: [],
      folders: [],
      file_origin: "local"
    }
  },
  methods: {
    handleClick: function() {
      axios({ method: "GET", "url": this.$octo_ip+"/api/settings", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        this.cam = ""+result.data.webcam.streamUrl;
        console.log(result);
        console.log(this.cam);
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
        console.log(result);
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
        console.log(result);
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
    loadCam: function() {
      var self = this;
      axios({ method: "GET", "url": this.$octo_ip+"/api/settings", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        self.cam = result.data.webcam.streamUrl;
        console.log(result);
      }, error => {
          console.error(error);
      });
    },
    loadFiles: function() {
      var self = this;
      axios({ method: "GET", "url": this.$octo_ip+"/api/files?recursive=true", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        this.fileList = result.data.files;
        //console.log(result.data.files);
        var self = this;
        var files = [];
        var folders = [];

        var path = this.selectedfolder.split("/");
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
              jQuery.each(pathobj.children, function(index, value) {
                  if(value.type == "folder") {
                    folders.push(value);
                  } else {
                    files.push(value);
                  }
              });
              $('#filestable > tbody:last-child').append('<tr onclick=""><td colspan="3" onclick="folderup()">&#x2190; back</td></tr>');
              jQuery.each(folders, function(index, value) {
                  $('#filestable > tbody:last-child').append('<tr onclick="selectFolder(\''+value.path+'\')"><td><span class="icon">&#128193;</span></td><td>'+value.display+'</td><td></td></tr>');
              });
              jQuery.each(files, function(index, value) {
                var img;
                var download;
                if(value.refs.resource != null) {
                  if(self.file_origin == "local" && value.refs.resource.includes(".gcode")) {
                    img = value.refs.download.replace(".gcode", ".png");
                    download = value.refs.download;
                  }

                  if(self.file_origin == "sdcard" && value.refs.resource.includes(".gco")) {
                    img = value.refs.resource.replace(".gco", ".png");
                    download = value.refs.resource;
                  }
                  var imgid = value.display.replace(".", "");

                  if(value.date != null) {
                    var tstamp = new Date(value.date*1000);
                    var day = "0"+tstamp.getDate();
                    var month = "0"+tstamp.getMonth();
                    var date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                  } else {
                    var date = "";
                  }
                  $('#filestable > tbody:last-child').append('<tr onclick="selectFile(this, { display: \''+value.display+'\', name: \''+value.name+'\', origin: \''+value.origin+'\', path: \''+value.path+'\', type: \''+value.type+'\', refs: { resource: \''+value.refs.resource+'\', download: \''+download+'\' } })"><td><figure class="image is-128x128"><img src="'+img+'" id="thumb_'+imgid+'" class="thumb" onmousemove="zoomIn(\''+imgid+'\', event)" onmouseout="zoomOut(\''+imgid+'\')" onerror="this.src=\'img/placeholder.png\'"></figure><div class="overlay_wrapper"><div id="overlay_'+imgid+'" class="zoomoverlay" style="background-image: url(\'' +img+ '\')"></div></div></td><td>'+value.display+'</td><td>'+date+'<div class="file_buttons" id="fb_'+imgid+'"><span id="btn_load" class="button is-warning is-small" disabled onclick="loadprintFile(false)">load</span> <span id="btn_print" class="button is-success is-small" disabled onclick="loadprintFile(true)">print</span> <span id="btn_delete" class="button is-danger is-small" disabled onclick="deleteFile()">delete</span></div></td></tr>');
                }
              });
            }
          } else { // Main folder
            jQuery.each(this.fileList, function(index, value) {
              if(value.origin == self.file_origin) {
                  if(value.type == "folder") {
                    folders.push(value);
                  } else {
                    files.push(value);
                  }
              }
            });
            if(folders.length > 0) {
              jQuery.each(folders, function(index, value) {
                  $('#filestable > tbody:last-child').append('<tr onclick="selectFolder(\''+value.path+'\')"><td><span class="icon">&#128193;</span></td><td>'+value.display+'</td><td></td></tr>');
              });
            }
            if(files.length > 0) {
              jQuery.each(files, function(index, value) {
                var img;
                var download;
                if(value.refs.resource != null) {
                  if(self.file_origin == "local" && value.refs.resource.includes(".gcode")) {
                    img = value.refs.download.replace(".gcode", ".png");
                    download = value.refs.download;
                  }

                  if(self.file_origin == "sdcard" && value.refs.resource.includes(".gco")) {
                    img = value.refs.resource.replace(".gco", ".png");
                    download = value.refs.resource;
                  }
                  var imgid = value.display.replace(".", "");

                  if(value.date != null) {
                    var tstamp = new Date(value.date*1000);
                    var day = "0"+tstamp.getDate();
                    var month = "0"+tstamp.getMonth();
                    var date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                  } else {
                    var date = "";
                  }
                  $('#filestable > tbody:last-child').append('<tr onclick="selectFile(this, { display: \''+value.display+'\', name: \''+value.name+'\', origin: \''+value.origin+'\', path: \''+value.path+'\', type: \''+value.type+'\', refs: { resource: \''+value.refs.resource+'\', download: \''+download+'\' } })"><td><figure class="image is-128x128"><img src="'+img+'" id="thumb_'+imgid+'" class="thumb" onmousemove="zoomIn(\''+imgid+'\', event)" onmouseout="zoomOut(\''+imgid+'\')" onerror="this.src=\'img/placeholder.png\'"></figure><div class="overlay_wrapper"><div id="overlay_'+imgid+'" class="zoomoverlay" style="background-image: url(\'' +img+ '\')"></div></div></td><td>'+value.display+'</td><td>'+date+'<div class="file_buttons" id="fb_'+imgid+'"><span id="btn_load" class="button is-warning is-small" disabled onclick="loadprintFile(false)">load</span> <span id="btn_print" class="button is-success is-small" disabled onclick="loadprintFile(true)">print</span> <span id="btn_delete" class="button is-danger is-small" disabled onclick="deleteFile()">delete</span></div></td></tr>');
                }
              });
            }
          }
          



        
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
    },
    allFiles: {
      get() {
        
        



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
