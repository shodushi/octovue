<template>
  <div id="app">

    <div id="configuration" v-if="$localStorage.get('octo_ip') == null && !next">
      <section class="section">

        <h1 class="title">Welcome to OctoVue</h1>
        <h2 class="subtitle">please fill out your config</h2>

        <div class="container is-fluid" style="margin-top: 5%;">
          <div class="columns">
            <div class="column is-one-fifths">
            </div>
            <div class="column is-three-fifths">
              <div class="field" style="text-align: left;">
                <label class="label">OctoPrint address:</label>
                <div class="control">
                  <input class="input" type="text" v-model="octo_ip" placeholder="http://192.168.1.10:5000">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">OctoPrint apikey:</label>
                <div class="control">
                  <input class="input" type="text" v-model="apikey" placeholder="86DA1D669334418CB773A50A142A4E72">
                </div>
              </div>
              <!--v-if="octo_ip != '' && apikey != '' && connectionSettings.options.printerProfiles.length == 0"!--> 
              <div class="field is-grouped" style="margin-top: 7%;">
                <div class="control">
                  <button class="button is-info" v-on:click="checkConnection()">check connection</button>
                </div>
              </div>

              <div id="wrapper" v-if="connectionSettings.options.printerProfiles.length > 0">
                <div class="field" style="text-align: left;">
                <label class="label">Printerport</label>
                <div class="control">
                  <div class="select">
                    <select v-model="printerport">
                      <option>choose</option>
                      <option v-for="port in avail_printerports">{{port}}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">Baudrate</label>
                <div class="control">
                  <div class="select">
                    <select v-model="baudrate">
                      <option>choose</option>
                      <option v-for="rate in avail_baudrates">{{rate}}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">printer profile</label>
                <div class="control">
                  <div class="select">
                    <select v-model="printerProfile">
                      <option>choose</option>
                      <option v-for="profile in printerProfiles">{{profile.id}}</option>
                    </select>
                  </div>
                </div>
              </div>
                <div class="field" style="text-align: left;">
                  <label class="label">Printer type</label>
                  <div class="control">
                    <div class="select">
                      <select v-model="printer_firmware">
                        <option>choose</option>
                        <option>marlin</option>
                        <option>reprap</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="field" style="text-align: left;">
                  <div class="control">
                  <input id="previewimages" type="checkbox" name="previewimages" class="switch is-rounded is-outlined" checked="checked" v-model="previewimages">
                  <label for="previewimages">show preview images in filebrowser</label>
                  </div>
                </div>

                <div class="field" style="text-align: left;">
                  <div class="control">
                  <input id="powerhandling" type="checkbox" name="powerhandling" class="switch is-rounded is-outlined" checked="" v-model="powerhandling">
                  <label for="powerhandling">enable printer powerswitch</label>
                  </div>
                </div>

                <div class="field" v-if="powerhandling" style="text-align: left;">
                  <label class="label">Powerswitch IP:</label>
                  <div class="control">
                    <input class="input" type="text" v-model="tasmota_ip" placeholder="192.168.120.81">
                  </div>
                </div>

                <div class="field" style="text-align: left;">
                  <div class="control">
                  <input id="lighthandling" type="checkbox" name="lighthandling" class="switch is-rounded is-outlined" checked="" v-model="lighthandling">
                  <label for="lighthandling">enable light switch</label>
                  </div>
                </div>

                <div class="field" v-if="lighthandling" style="text-align: left;">
                  <label class="label">Light device IP:</label>
                  <div class="control">
                    <input class="input" type="text" v-model="led_ip" placeholder="192.168.120.81">
                  </div>
                </div>

                <div class="field" style="text-align: left;">
                  <label class="label">CORS anywhere proxy IP:</label>
                  <div class="control">
                    <input class="input" type="text" v-model="cors_proxy" placeholder="http://192.168.120.244:8090">
                  </div>
                </div>
              </div>

              <div class="field is-grouped" style="margin-top: 7%;">
                <div class="control">
                  <label for="importfile" class="button">
                    <span class="icon is-small">
                      <i class="fas fa-file-upload"></i>
                    </span>
                    &nbsp; import config
                  </label>
                  <input id="importfile" style="visibility:hidden;" type="file" @change="importConfig($event)">
                  <button class="button is-link" v-on:click="submitConfig()" v-if="connectionSettings.options.printerProfiles.length > 0">Submit</button>
                </div>
              </div>

            </div>
            <div class="column is-one-fifths">
            </div>
          </div>

        </div>

      </section>
    </div>

    <div id="octovue" v-if="$route.path != '/tft'">

      <article id="messagebox" class="message is-danger">
        <div id="messagebox_body" class="message-body"></div>
      </article>
      
      <div id="main" v-if="$localStorage.get('octo_ip') != null && next">
        <div :class="{'is-active': pageLoader}" class="pageloader"><span class="title">connecting to OctoPrint instance<br /><span class="title" v-if="octoprintConnectionTries >= octoprintConnectionMaxTries">{{pageLoaderAddText}}</span></span></div>
        <div id="dropzoneProgress">
          <div class="imgContainer"><img src="img/upload.gif"></div>
          <div class="textContainer"><h3>uploading...</h3></div>
        </div>

        <div id="burger" style="position: absolute; top: 0px; right: 0px; z-index: 999;">
          <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" @click="isOpen = !isOpen" v-bind:class="{'is-active': isOpen}">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <nav class="navbar is-transparent">
          <div class="navbar-brand" style="width: 1px;">
            <a class="navbar-item" href="/">
              <img src="/img/octovue_logo.png" style="margin-right: 5px;"/>OctoVue
            </a>
          </div>

                    
          <div id="navbarExampleTransparentExample" class="navbar-menu" v-bind:class="{'is-active': isOpen}">
            <div class="navbar-start" style="width: 80%;">
              <div id="meta" class="field is-grouped is-grouped-multiline" style="margin: 14px 0px 0px 20%;" v-if="!isOpen">
                <div class="control" id="control_power" v-if="$localStorage.get('powerhandling') == 'yes'">
                  <div class="tags has-addons">
                    <span class="tag">Power</span>
                    <a class="tag" :class="{'is-success': isPower, 'is-danger': isNotPower}" id="tag_printer_power" v-on:click="powerswitch()">{{ powerState }}</a>
                  </div>
                </div>

                <div class="control">
                  <div class="tags has-addons">
                    <span class="tag">Connection</span>
                    <a class="tag" :class="{'is-success': isConnection, 'is-danger': isNotConnection, 'is-warning': isConnecting}" id="tag_btn_connect" v-on:click="printerConnection()">{{ connectionState }}</a>
                  </div>
                </div>

                <div class="control" id="control_light" v-if="$localStorage.get('lighthandling') == 'yes'">
                  <div class="tags has-addons">
                    <span class="tag">Light</span>
                    <a class="tag" :class="{'is-success': isLight, 'is-danger': isNotLight}" id="tag_lightswitch" v-on:click="lightswitch()">{{ lightState }}</a>
                  </div>
                </div>
              </div>

              <div class="nav-divider" v-if="isOpen"></div>

              <a href="" class="navbar-item" v-if="isOpen" v-on:click="powerswitch()">Power ({{ powerState }})</a>
              <a href="" class="navbar-item" v-if="isOpen" v-on:click="printerConnection()">Connection ({{ connectionState }})</a>
              <a href="" class="navbar-item" v-if="isOpen" v-on:click="lightswitch()">Light ({{ lightState }})</a>

              <div class="nav-divider"></div>

              <router-link class="navbar-item" to='/' @click.native="isOpen = false">Home</router-link>
              <router-link class="navbar-item" to='/printpage' @click.native="isOpen = false">Printpage</router-link>
              <router-link class="navbar-item" to='/stats' @click.native="isOpen = false">Stats</router-link>
              <router-link class="navbar-item" to='/dashboard' @click.native="isOpen = false">Dashboard</router-link>
              <!--<router-link class="navbar-item" to='/live'>Live</router-link>!-->
              <router-link class="navbar-item" to='/tft' @click.native="isOpen = false">TFTScreen</router-link>
              
            </div>

            <div class="navbar-end" style="width: 10%">
              
              <div class="navbar-item">
                <div class="field is-grouped">
                  <p class="control">
                    <a class="bd-tw-button button is-small is-info" v-on:click="toggleTerminal()">
                      <span class="icon">
                        <i class="fas fa-terminal"></i>
                      </span>
                      <span>Terminal</span>
                    </a>
                  </p>
                  <p class="control">
                    <a class="button is-info is-small" v-on:click="toggleInfo()">
                      <span class="icon">
                        <i class="fas fa-info-circle"></i>
                      </span>
                      <span>Info</span>
                    </a>
                  </p>
                  <p class="control">
                    <a class="bd-tw-button button is-small is-info">
                    <router-link class="navbar-item" to='/settings'><span class="icon" style="color: white;">
                        <i class="fas fa-cog"></i>
                      </span></router-link>
                      </a>
                  </p>
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
              <button class="delete" aria-label="close" v-on:click="toggleInfo"></button>
            </header>
            <section class="modal-card-body">
              <div class="content">
                <h3>General</h3>
                <p>Octoprint installation is required for OctoVue to work and control your printer. Just add your octoprint ipaddress:port and set your octoprint's api key and enable CORS in octoprint settings.</p>
                <h3>Uploading files</h3>
                <p>Navigate to the destination folder and just drag and drop the gcode file into this browser window.<br />For now, only uploading to octoprint's local storage is used.</p>
                <h3>Printer power</h3>
                <p>For switching the printer on/off I use a &quot;Sonoff POW with esphome firmware&quot;. If you plan the same/similar setup, add your sonoff's ip-address to config and switch powerhandling on.</p>
                <h3>Light control</h3>
                <p>For switching the enclosure lights on/off I use a &quot;nodemcu flashed with esphome&quot;, integrated into homeassistant. If you plan the same/similar setup, add your led-controlling-device's ip-address and switch lighthandling on.</p>
              </div>
            </section>
            <footer class="modal-card-foot">
              <button class="button" v-on:click="toggleInfo">Got it</button>
            </footer>
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <div id="terminal" v-if="terminalmodal">
            <div id="terminal_header">
              <div style="width: 96%; float: left;">Terminal</div>
              <button class="delete" aria-label="close" v-on:click="toggleTerminal" style=""></button>
            </div>
            <div class="field">
              <div class="control">
                <textarea id="terminal_console" class="textarea is-warning" placeholder="" v-model="terminalLogs"></textarea>
              </div>
            </div>
          </div>
        </transition>

        <router-view />

        <footer class="footer">
          <div class="content has-text-centered">
            <p>
              <strong>OctoVue</strong>
              <a href="https://github.com/shodushi/octovue" target="_blank"> -&gt; GitHub</a>
            </p>
          </div>
        </footer>
      </div>
    </div>

    <div id="tftview" v-if="$route.path == '/tft'">
      <router-view />
    </div>
  </div>
</template>

<script>
import Chart from 'vue-bulma-chartjs';
import axios from "axios";

export default {
  linkActiveClass: 'is-active',
  props: {
  },
  data() {
    return {
      isOpen: false,
      next: false,
      octo_ip: "",
      apikey: "",
      printerport: "choose",
      baudrate: "choose",
      printerProfile: "choose",
      printer_firmware: "choose",
      previewimages: true,
      powerhandling: "",
      tasmota_ip: "",
      tasmota_toggle: "",
      tasmota_status: "",
      lighthandling: "",
      light_toggle: "",
      light_status: "",
      led_ip: "",
      cors_proxy: ""
    };
  },
  created: function() {
    var self = this;
    var octoDropzone = new Dropzone(document.body, {
      init: function() {
        this.on("sending", function(file, xhr, formData) {
          $(".dz-preview").css("display", "none");
          if(file.name.split('.').pop() != "gcode" && file.name.split('.').pop() != "gco") {
            self.displayMsg('upload_invalid_file');
	    		} else {
            formData.append("path", self.selectedfolder);
            $("#dropzoneProgress").css("display", "block");
          }
			});
			this.on("success", function() {
				$("#dropzoneProgress").css("display", "none");
				self.loadFiles();
      });
      this.on('error', function(file, response) {
        $("#dropzoneProgress").css("display", "none");
      });
		},
      url: this.$localStorage.get('octo_ip')+"/api/files/local"
    });
    this.configFromFile();
  },
  mounted: function() {
    //this.$localStorage.set('dashboardLayout', 'undefined');
    if(this.$localStorage.get('theme') != null && this.$localStorage.get('theme') != 'undefined') {
      $("#theme").attr("href", "css/themes/"+this.$localStorage.get('theme')+".css");
    } else {
      $("#theme").attr("href", "css/themes/light.css");
    }
    if(this.$localStorage.get('octo_ip') == null || this.$localStorage.get('apikey') == null) {
      this.configFromFile();
      //return false;
    } else {
      this.next = true;
    }
    setTimeout(this.loadOctoprintSettings, 1)
    setTimeout(this.getPowerState, 1)
    setTimeout(this.getLightState, 1)
    //if(this.$route.path != '/tft') {
      setTimeout(this.loadFiles(), 1);
      setTimeout(this.getStats, 5);
    //}
    setTimeout(this.getOctoprintConnection, 1)
    setTimeout(this.getOctoPrintProfiles, 1);
    setTimeout(this.sockConnection, 2);
    setTimeout(this.getOctoPrintCommands, 500);
    
    if(this.printerState.payload.state_string != "Operational" && this.printerState.payload.state_string != "Printing" && this.printerState.payload.state_string != "Paused") {
      this.$store.state.isNotConnection = true;
      this.$store.state.isConnection = false;
      this.$store.state.isConnecting = false;
      this.$store.state.connectionState = "off";
    } else if(this.printerState.payload.state_string == "Connecting") {
      this.$store.state.isNotConnection = false;
      this.$store.state.isConnection = false;
      this.$store.state.isConnecting = true;
      this.$store.state.connectionState = "...";
    } else {
      this.$store.state.isNotConnection = false;
      this.$store.state.isConnection = true;
      this.$store.state.isConnecting = false;
      this.$store.state.connectionState = "on";
    }
    if(this.$localStorage.get('dashboardLayout') == null || this.$localStorage.get('dashboardLayout') == 'undefined') {
      var dashboardLayout = [
        {
            id: 1,
            title: 'Box 1',
            hidden: false,
            position: {
                x: 4,
                y: 0,
                w: 2,
                h: 1
            }
        },
        {
            id: 2,
            title: 'Box Zwei',
            hidden: false,
            pinned: false,
            position: {
                x: 6,
                y: 0,
                w: 1,
                h: 2
            }
        },
        {
            id: 3,
            title: 'Box Three',
            hidden: false,
            pinned: false,
            position: {
                x: 4,
                y: 1,
                w: 2,
                h: 3
            }
        },
        {
            id: 4,
            title: 'Box 4 Suess Sauer',
            hidden: false,
            pinned: false,
            position: {
                x: 6,
                y: 2,
                w: 3,
                h: 1
            }
        }
      ];
      this.$localStorage.set('dashboardLayout', JSON.stringify(dashboardLayout));
    }
  },
  methods: {
    powerswitch: function() {
      axios({ method: "POST", "url": this.$localStorage.get('tasmota_ip')+this.$localStorage.get('tasmota_toggle') }).then(result => {
        this.getPowerState();
      }, error => {
        console.error(error);
      });
      /*
      this.transport("GET", "tasmota_ip", "/cm?cmnd=Power%20TOGGLE", null).then(result => {
        if(typeof(result) == "object") {
          this.$store.state.powerState = result.data.POWER.toLowerCase();
          if(this.powerState == "off") {
            this.$store.state.isNotPower = true;
            this.$store.state.isPower = false;
          } else {
            this.$store.state.isNotPower = false;
            this.$store.state.isPower = true;
          }
        }
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
        this.transport("GET", "tasmota_ip", "/cm?cmnd=Status", null).then(result => {
          if(typeof(result) == "object") {
            if(result.data.Status.Power == 0) {
              this.$store.state.powerState = 'off';
              this.$store.state.isNotPower = true;
              this.$store.state.isPower = false;
            } else {
              this.$store.state.powerState = 'on';
              this.$store.state.isNotPower = false;
              this.$store.state.isPower = true;
            }
          }
        });
      }
      */
    },
    lightswitch: function() {
      this.transport("POST", "led_ip", "/light/3d_drucker_led/toggle", null).then(result => {
        if(typeof(result) == "object") {
          this.getLightState();
        }
      });
    },
    getLightState: function() {
      if(this.$localStorage.get('lighthandling') == "yes") {
        this.transport("GET", "led_ip", "/light/3d_drucker_led/state", null).then(result => {
          if(typeof(result) == "object") {
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
          }
        });
      }
    },
    printerConnection: function() {
      if(this.$localStorage.get('baudrate') == null || this.$localStorage.get('printerport') == null || this.$localStorage.get('printerProfile') == null || this.$localStorage.get('baudrate') == "choose" || this.$localStorage.get('printerport') == "choose" || this.$localStorage.get('printerProfile') == "choose") {
        this.displayMsg('octoprint_printersetup_error');
      } else {
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
        this.transport("POST", "octo_ip", "/api/connection", JSON.stringify(obj)).then(result => {
          if(typeof(result) == "object") {
            this.$store.state.isNotConnection = false;
            this.$store.state.isConnection = true;
            this.$store.state.isConnecting = true;
            this.$store.state.connectionState = "...";
          }
        });
      }
      
    },
    loadCam: function() {
      var self = this;
      this.transport("GET", "octo_ip", "/api/settings", null).then(result => {
        if(typeof(result) == "object") {
          this.$store.state.cam = result.data.webcam.streamUrl;
        }
      });
    },
    getOctoPrintCommands: function() {
      this.transport("GET", "octo_ip", "/api/system/commands/core", null).then(result => {
        if(typeof(result) == "object") {
          this.$store.state.octoprintCommands = result.data;
        }
      });
    },
    checkConnection: function() {
      axios({ method: "GET", "url": this.octo_ip+"/api/connection", headers: {'X-Api-Key': this.apikey} }).then(result => {
        if(result.status != 200) {
          this.displayMsg('octoprint_conn_error');
        } else {
          this.$store.state.connectionSettings = result.data;
          this.$store.state.printerProfiles = result.data.options.printerProfiles;
          this.$store.state.avail_printerports = result.data.options.ports;
          this.$store.state.avail_baudrates = result.data.options.baudrates;
        }
      }).catch(error => {
        this.displayMsg('octoprint_conn_error');
        //console.log(error.response)
      });

    },
    getOctoprintConnection: function() {
      this.transport("GET", "octo_ip", "/api/connection", null).then(result => {
        if(typeof(result) == "object") {
          this.$store.state.connectionSettings = result.data;
          this.$store.state.pageLoader = false;
          this.$store.state.printerProfiles = result.data.options.printerProfiles;
          this.$store.state.avail_printerports = result.data.options.ports;
          this.$store.state.avail_baudrates = result.data.options.baudrates;
        } else {
          this.displayMsg('octoprint_conn_error');
          if(this.$store.state.octoprintConnectionTries < self.$store.state.octoprintConnectionMaxTries) {
            setTimeout(function(){
              this.$store.state.octoprintConnectionTries = self.$store.state.octoprintConnectionTries + 1;
              this.getOctoprintConnection();
            }, 1000);
          } else {
            this.$store.state.pageLoaderAddText = "Connection failed, seems like OctoPrint server is not available!?";
          }
        }
      });
    },
    submitConfig: function() {
      this.$localStorage.set('octo_ip', this.octo_ip);
      this.$localStorage.set('apikey', this.apikey);
      this.$localStorage.set('printerport', this.printerport);
      this.$localStorage.set('baudrate', this.baudrate);
      this.$localStorage.set('printerProfile', this.printerProfile);
      this.$localStorage.set('printer_firmware', this.printer_firmware);
      if(this.previewimages) {
        this.$localStorage.set('previewimages', 'yes');
      } else {
        this.$localStorage.set('previewimages', 'no');
      }
      if(this.powerhandling) {
        this.$localStorage.set('powerhandling', 'yes');
      } else {
        this.$localStorage.set('powerhandling', 'no');
      }
      this.$localStorage.set('tasmota_ip', this.tasmota_ip);
      this.$localStorage.set('tasmota_toggle', this.tasmota_toggle);
      this.$localStorage.set('tasmota_status', this.tasmota_status);
      if(this.lighthandling) {
        this.$localStorage.set('lighthandling', 'yes');
      } else {
        this.$localStorage.set('lighthandling', 'no');
      }
      this.$localStorage.set('led_ip', this.led_ip);
      this.$localStorage.set('led_toggle', this.led_toggle);
      this.$localStorage.set('led_status', this.led_status);
      this.$localStorage.set('cors_proxy', this.cors_proxy);
      this.$store.state.settingsmodal = false;
      this.$router.go();
    },
    exportConfig: function() {
      var config = {
        octo_ip: this.$localStorage.get('octo_ip'),
        apikey: this.$localStorage.get('apikey'),
        printerport: this.$localStorage.get('printerport'),
        baudrate: this.$localStorage.get('baudrate'),
        printerProfile: this.$localStorage.get('printerProfile'),
        printer_firmware: this.$localStorage.get('printer_firmware'),
        previewimages: this.$localStorage.get('previewimages'),
        powerhandling: this.$localStorage.get('powerhandling'),
        tasmota_ip: this.$localStorage.get('tasmota_ip'),
        tasmota_toggle: this.$localStorage.get('tasmota_toggle'),
        tasmota_status: this.$localStorage.get('tasmota_status'),
        lighthandling: this.$localStorage.get('lighthandling'),
        led_ip: this.$localStorage.get('led_ip'),
        led_toggle: this.$localStorage.get('led_toggle'),
        led_status: this.$localStorage.get('led_status'),
        cors_proxy: this.$localStorage.get('cors_proxy')
      };
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:attachment/text,' + encodeURI(JSON.stringify(config));
      hiddenElement.target = '_blank';
      hiddenElement.download = 'octovue_config.txt';
      hiddenElement.click();
    },
    importConfig: function(event) {
      var self = this;
      var uploadedFile = event.target.files[0]; 
      var readFile = new FileReader();
      readFile.onload = function(e) { 
          var contents = e.target.result;
          var json = JSON.parse(contents);
          self.octo_ip = json.octo_ip;
          self.apikey = json.apikey;
          self.printerport = json.printerport;
          self.baudrate = json.baudrate;
          self.printerProfile = json.printerProfile;
          self.printer_firmware = json.printer_firmware;
          self.previewimages = false;
          if(json.previewimages == "yes") {
            self.previewimages = true;
          }
          self.powerhandling = false;
          if(json.powerhandling == "yes") {
            self.powerhandling = true;
          }
          self.tasmota_ip = json.tasmota_ip;
          self.tasmota_toggle = json.tasmota_toggle;
          self.tasmota_status = json.tasmota_status;
          self.lighthandling = false;
          if(json.lighthandling == "yes") {
            self.lighthandling = true;
          }
          self.led_ip = json.led_ip;
          self.led_toggle = json.led_toggle;
          self.led_status = json.led_status;
          self.cors_proxy = json.cors_proxy;
          self.checkConnection();
      };
      readFile.readAsText(uploadedFile);
    }
  }
}
</script>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
}

#dropzoneProgress {
  display: none;
  position: absolute;
  top: 40%;
  left: 25%;
  width: 50%;
  height: 100px;
  background-color: white;
  color: black;
  border: 1px dashed black;
  z-index: 999;
  text-align: center;
  font-size: 20px;
}
#dropzoneProgress .imgContainer { vertical-align: middle; }
#dropzoneProgress .textContainer { display: inline-block; }


/*temperature slider*/
.temp_ist {
  position: relative;
  width: 20px;
  height: 130px;
  background-color: #f6f6f6;
  border: 1px solid #b6b6b6;
  vertical-align: bottom;
}
.temp_ist div {
  position: absolute;
  bottom: 0px;
  width: 18px;
  max-height: 128px;
}
.temp_ist #temp_tool0_actual {
  background-color: #ff3055;
}
.temp_ist #temp_bed_actual {
  background-color: #1c92eb;
}
#sliderextruderoutput {
  background-color: white;
  color: #ff3055;
  font-weight: bold;
}
#sliderbedoutput {
  background-color: white;
  color: #1c92eb;
  font-weight: bold;
}
/*terminal*/
#terminal {
  position: absolute;
  top: 100px;
  left: 20%;
  width: 70%;
  max-width: 800px;
  height: 600px;
  z-index: 999;
}
#terminal_header {
  background-color: #ffdd57;
  color: black;
  cursor: grab;
  padding: 4px;
}
#terminal_console {
  height: 500px;
  background-color: rgba(0,0,0,0.8);
  color: #fff;
}

/*transitions*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s
}
.fade-enter,
.fade-leave-to
/* .fade-leave-active in <2.1.8 */
{
  opacity: 0
}
.slide-enter-active, .slide-leave-active  {
  transition: all .6s ease;
}
.slide-enter, .slide-leave-to
{
  transform: translateX(-100%), translateY(-100%);
  opacity: 0;
}
.nav-divider {
  width: 11px; height: 80%; margin: 5px 10px 0px 20px; background-color: #C0C0C0; border: 5px solid white;
}

/*common stuff*/
.has-margin {
  margin-left: 20px;
}
#messagebox {
  position: absolute;
  top: 20%;
  left: 10px;
  z-index: 999;
  width: 40%;
  height: auto;
  display: none;
}
#messagebox div {
  font-size: 100%;
}
.column {
  margin: 10px 10px 10px 10px !important;
}
</style>
