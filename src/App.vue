<template>
  <div id="app">

    <div id="configuration" v-if="$localStorage.get('octo_ip') == null">
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

              <div class="field" style="text-align: left;">
                <label class="label">Printerport</label>
                <div class="control">
                  <input class="input" type="text" v-model="printerport" placeholder="/dev/ttyACM0">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">Baudrate</label>
                <div class="control">
                  <input class="input" type="text" v-model="baudrate" placeholder="115200">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">printer profile</label>
                <div class="control">
                  <input class="input" type="text" v-model="printerProfile" placeholder="_default">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">Printer type</label>
                <div class="control">
                  <div class="select">
                    <select v-model="printer_firmware">
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

              <div class="field is-grouped" style="margin-top: 7%;">
                <div class="control">
                  <label for="importfile" class="button">
                    <span class="icon is-small">
                      <i class="fas fa-file-upload"></i>
                    </span>
                    &nbsp; import config
                  </label>
                  <input id="importfile" style="visibility:hidden;" type="file" @change="importConfig($event)">
                  <button class="button is-link" v-on:click="submitConfig()">Submit</button>
                </div>
              </div>

            </div>
            <div class="column is-one-fifths">
            </div>
          </div>

        </div>

      </section>
    </div>

    <div id="main" v-if="$localStorage.get('octo_ip') != null">
      <div :class="{'is-active': pageLoader}" class="pageloader"><span class="title">connecting to OctoPrint instance<br /><span class="title" v-if="octoprintConnectionTries >= octoprintConnectionMaxTries">{{pageLoaderAddText}}</span></span></div>
      <article id="messagebox" class="message is-danger">
        <div id="messagebox_body" class="message-body"></div>
      </article>
      <div id="dropzoneProgress">
        <div class="imgContainer"><img src="img/upload.gif"></div>
        <div class="textContainer"><h3>uploading...</h3></div>
      </div>

      <nav class="navbar is-transparent">
        <div class="navbar-brand" style="width: 20px;">
          <a class="navbar-item" href="/">
            OctoVue
          </a>
        </div>

        <div id="navbarExampleTransparentExample" class="navbar-menu">
          <div class="navbar-start" style="width: 60%;">
            <div id="meta" class="field is-grouped is-grouped-multiline" style="margin: 14px 0px 0px 20%;">
              <div class="control" id="control_power" v-if="$localStorage.get('powerhandling') == 'yes'">
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

              <div class="control" id="control_light" v-if="$localStorage.get('lighthandling') == 'yes'">
                <div class="tags has-addons">
                  <span class="tag">Light</span>
                  <a class="tag" :class="{'is-success': isLight, 'is-danger': isNotLight}" id="tag_lightswitch" v-on:click="lightswitch">{{ lightState }}</a>
                </div>
              </div>
            </div>

            <div class="nav-divider"></div>

            <router-link class="navbar-item" to='/'>Home</router-link>
            <router-link class="navbar-item" to='/printpage'>Printpage</router-link>
            <router-link class="navbar-item" to='/stats'>Stats</router-link>
            
          </div>

          <div class="navbar-end">
            <div class="navbar-item">
              <div class="field is-grouped">
                <p class="control">
                  <a class="bd-tw-button button is-small" v-on:click="toggleTerminal()">
                    <span class="icon">
                      <i class="fas fa-terminal"></i>
                    </span>
                    <span>Terminal</span>
                  </a>
                </p>
                <p class="control">
                  <a class="button is-primary is-small" v-on:click="toggleInfo()">
                    <span class="icon">
                      <i class="fas fa-info-circle"></i>
                    </span>
                    <span>Info</span>
                  </a>
                </p>
                <p class="control">
                  <a class="bd-tw-button button is-small" v-on:click="showSettings()">
                    <span class="icon">
                      <i class="fas fa-cog"></i>
                    </span>
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
              <p>For switching the printer on/off I use a &quot;Sonoff POW with tasmota firmware&quot;. If you plan the same/similar setup, add your sonoff's ip-address to config and switch powerhandling on.</p>
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

      <div class="modal" v-bind:class="{ 'is-active' : settingsmodal }">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Settings</p>
            <button class="delete" aria-label="close" v-on:click="showSettings"></button>
          </header>
          <section class="modal-card-body">
            <div class="content">
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

              <div class="field" style="text-align: left;">
                <label class="label">Printerport</label>
                <div class="control">
                  <input class="input" type="text" v-model="printerport" placeholder="/dev/ttyACM0">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">Baudrate</label>
                <div class="control">
                  <input class="input" type="text" v-model="baudrate" placeholder="115200">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">printer profile</label>
                <div class="control">
                  <input class="input" type="text" v-model="printerProfile" placeholder="_default">
                </div>
              </div>
              <div class="field" style="text-align: left;">
                <label class="label">Printer type</label>
                <div class="control">
                  <div class="select">
                    <select v-model="printer_firmware">
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
          </section>
          <footer class="modal-card-foot">
            <label for="importfile" class="button">
              <span class="icon is-small">
                <i class="fas fa-file-upload"></i>
              </span>
              &nbsp; import config
            </label>
            <button class="button" v-on:click="exportConfig()">
              <span class="icon is-small">
                <i class="fas fa-file-download"></i>
              </span>
              &nbsp; export config</label>
            </button>
            <input id="importfile" style="visibility:hidden;" type="file" @change="importConfig($event)">
            <button class="button" v-on:click="submitConfig()">save</button>
          </footer>
        </div>
      </div>

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
</template>

<script>
import axios from "axios";
import Chart from 'vue-bulma-chartjs';

export default {
  linkActiveClass: 'is-active',
  props: {
  },
  data() {
    return {
      octo_ip: "",
      apikey: "",
      printerport: "",
      baudrate: "",
      printerProfile: "",
      printer_firmware: "marlin",
      previewimages: true,
      powerhandling: "",
      tasmota_ip: "",
      lighthandling: "",
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
  },
  mounted: function() {
    if(this.$localStorage.get('octo_ip') == null || this.$localStorage.get('apikey') == null) { return false;}
    setTimeout(this.loadCam, 500)
    setTimeout(this.getPowerState, 1)
    setTimeout(this.getLightState, 1)
    setTimeout(this.loadFiles, 1)
    setTimeout(this.getOctoprintConnection, 1)
    setTimeout(this.sockConnection, 2);
    if(this.printerState.payload.state_string != "Operational" && this.printerState.payload.state_string != "Connecting" && this.printerState.payload.state_string != "Paused") {
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
  },
  methods: {
    powerswitch: function() {
      axios({ method: "GET", "url": this.$localStorage.get('cors_proxy')+"/"+this.$localStorage.get('tasmota_ip')+"/cm?cmnd=Power%20TOGGLE" }).then(result => {
        this.$store.state.powerState = result.data.POWER.toLowerCase();
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
    showSettings: function() {
      this.octo_ip = this.$localStorage.get('octo_ip');
      this.apikey = this.$localStorage.get('apikey');
      this.printerport = this.$localStorage.get('printerport');
      this.baudrate = this.$localStorage.get('baudrate');
      this.printerProfile = this.$localStorage.get('printerProfile');
      this.printer_firmware = this.$localStorage.get('printer_firmware');
      this.previewimages = false;
      if(this.$localStorage.get('previewimages') == "yes") {
        this.previewimages = true;
      }
      this.powerhandling = false;
      if(this.$localStorage.get('powerhandling') == "yes") {
        this.powerhandling = true;
      }
      this.tasmota_ip = this.$localStorage.get('tasmota_ip');
      this.lighthandling = false;
      if(this.$localStorage.get('lighthandling') == "yes") {
        this.lighthandling = true;
      }
      this.led_ip = this.$localStorage.get('led_ip');
      this.cors_proxy = this.$localStorage.get('cors_proxy');
      this.$store.state.settingsmodal = !this.$store.state.settingsmodal;
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
      if(this.lighthandling) {
        this.$localStorage.set('lighthandling', 'yes');
      } else {
        this.$localStorage.set('lighthandling', 'no');
      }
      this.$localStorage.set('led_ip', this.led_ip);
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
        lighthandling: this.$localStorage.get('lighthandling'),
        led_ip: this.$localStorage.get('led_ip'),
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
      console.log(event);
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
          self.lighthandling = false;
          if(json.lighthandling == "yes") {
            self.lighthandling = true;
          }
          self.led_ip = json.led_ip;
          self.cors_proxy = json.cors_proxy;
      };
      readFile.readAsText(uploadedFile);
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
}
</style>