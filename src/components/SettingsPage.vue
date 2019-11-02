<template>

  <div id="settingsPage" style="margin: 0 auto; padding: 5% 10% 0px 10%; overflow: hidden; min-height: 800px;">

    <table style="width: 100%; height: 100%;">
      <tr>
        <td style="width: 20%; border-right: 1px solid #C0C0C0;  height: 100%;">
          <aside class="menu">
            <ul class="menu-list">
              <li><a @click="subnav = 'octoprint'" style="line-height: 1.5rem;"><img src="/img/octoprint-icon.png" style="float: left; height: 1.5rem; width: 1.7rem; margin-right: 10px;">OctoPrint</a></li>
              <li><a @click="subnav = 'printer'" style="line-height: 1.5rem;"><img src="/img/printer-icon.png" style="float: left; height: 1.5rem; width: 1.7rem; margin-right: 10px;">Printer</a></li>
              <li><a @click="subnav = 'appearance'" style="line-height: 1.5rem;"><img src="/img/fullscreen-icon.png" style="float: left; height: 1.5rem; width: 1.7rem; margin-right: 10px;"> Appearance</a></li>
              <li><a @click="subnav = 'extdevices'" style="line-height: 1.5rem;"><img src="/img/ext-devs.png" style="float: left; height: 1.5rem; width: 1.7rem; margin-right: 10px;"> External devices</a></li>
            </ul>
          </aside>
        </td>
        <td style="width: 75%; padding: 0px 0px 0px 30px;">
          <section class="section" v-if="subnav == 'octoprint' || subnav == ''">
            <div class="container">
              <img src="/img/octoprint-icon.png" style="float: left; height: 2rem; margin-right: 10px;"><h2 class="title">OctoPrint</h2>
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
              <hr />
              <div class="field" style="text-align: left;">
                <label class="label">OctoPrint controls</label>
                <div class="buttons" v-for="command in octoprintCommands">
                  <button class="button is-primary is-light" v-on:click="octoPrintCommand(command.action)">{{command.name}}</button>
                </div>
              </div>
            </div>
          </section>

          <section class="section" v-if="subnav == 'printer'">
            <div class="container">
              
              <img src="/img/printer-icon.png" style="float: left; height: 2rem; margin-right: 10px;"><h2 class="title">Printer</h2>
              <div class="field" style="text-align: left;">
                <label class="label">Printerport</label>
                <div class="control">
                  <div class="select">
                    <select v-model="printerport">
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
                      <option>marlin</option>
                      <option>reprap</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="section" v-if="subnav == 'appearance'">
            <div class="container">
              <img src="/img/fullscreen-icon.png" style="float: left; height: 2rem; margin-right: 10px;"><h2 class="title">Appearance</h2>
              <div class="field is-separate" style="text-align: left;">
                <div class="control">
                <input id="previewimages" type="checkbox" name="previewimages" class="switch is-rounded is-outlined" checked="checked" v-model="previewimages">
                <label class="label" for="previewimages">show preview images in filebrowser</label>
                </div>
              </div>

              <div class="field is-separate" style="text-align: left;">
                <label class="label">OctoVue theme</label>
                <div class="buttons has-addons">
                  <span class="button" v-bind:class="{ 'is-selected': theme == 'light', 'is-primary': theme == 'light'}" v-on:click="theme = 'light'">Light</span>
                  <span class="button" v-bind:class="{ 'is-selected': theme == 'dark', 'is-primary': theme == 'dark'}" v-on:click="theme = 'dark'">Dark</span>
                </div>
              </div>
            </div>
          </section>

          <section class="section" v-if="subnav == 'extdevices'">
            <div class="container">
              <img src="/img/ext-devs.png" style="float: left; height: 2rem; margin-right: 10px;"><h2 class="title">External devices</h2>

              <div class="field" style="text-align: left;" :class="{'is-separate': !powerhandling}">
                <div class="control">
                <input id="powerhandling" type="checkbox" name="powerhandling" class="switch is-rounded is-outlined" checked="" v-model="powerhandling">
                <label class="label" for="powerhandling">enable printer powerswitch</label>
                </div>
              </div>

              <div class="field" v-if="powerhandling" style="text-align: left;">
                <label class="label has-margin">Powerswitch IP:</label>
                <div class="control has-margin">
                  <input class="input" type="text" v-model="tasmota_ip" placeholder="192.168.120.81">
                </div>
              </div>

              <div class="field" v-if="powerhandling" style="text-align: left;">
                <label class="label has-margin">Powerswitch toggle parameter:</label>
                <div class="control has-margin">
                  <input class="input" type="text" v-model="tasmota_toggle" placeholder="/cm?cmnd=Power%20TOGGLE">
                </div>
              </div>
              
              <div class="field is-separate" v-if="powerhandling" style="text-align: left;">
                <label class="label has-margin">Powerswitch status parameter:</label>
                <div class="control has-margin">
                  <input class="input" type="text" v-model="tasmota_status" placeholder="/cm?cmnd=Status">
                </div>
              </div>

              <div class="field" style="text-align: left;" :class="{'is-separate': !lighthandling}">
                <div class="control">
                <input id="lighthandling" type="checkbox" name="lighthandling" class="switch is-rounded is-outlined" checked="" v-model="lighthandling">
                <label class="label" for="lighthandling">enable light switch</label>
                </div>
              </div>

              <div class="field" v-if="lighthandling" style="text-align: left;">
                <label class="label has-margin">Light device IP:</label>
                <div class="control has-margin">
                  <input class="input" type="text" v-model="led_ip" placeholder="192.168.120.81">
                </div>
              </div>

              <div class="field" v-if="lighthandling" style="text-align: left;">
                <label class="label has-margin">Light device toggle parameter:</label>
                <div class="control has-margin">
                  <input class="input" type="text" v-model="led_toggle" placeholder="/light/3d_drucker_led/toggle">
                </div>
              </div>
              
              <div class="field is-separate" v-if="lighthandling" style="text-align: left;">
                <label class="label has-margin">Light device status parameter:</label>
                <div class="control has-margin">
                  <input class="input" type="text" v-model="led_status" placeholder="/light/3d_drucker_led/state">
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



        </td>
        <td style="width: 5%; padding: 0px 0px 0px 30px; text-align: right;">
          <label for="importfile" class="button is-fullwidth">
            <span class="icon is-small">
              <i class="fas fa-file-upload"></i>
            </span>
            &nbsp; import config
          </label>
          <input id="importfile" style="visibility:hidden;" type="file" @change="importConfig($event)">
          
          <button class="button is-fullwidth" v-on:click="exportConfig()">
            <span class="icon is-small">
              <i class="fas fa-file-download"></i>
            </span>
            &nbsp; export config
          </button>
          <br />
          
          <button class="button is-fullwidth" v-on:click="submitConfig()">
            <span class="icon is-small">
              <i class="fas fa-save"></i>
            </span>
            &nbsp; save config</button>
        </td>
      </tr>
    </table>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from "axios";

export default {
  data() {
    return {
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
      led_toggle: "",
      led_status: "",
      cors_proxy: "",
      subnav: "",
      theme: ""
    };
  },
  mounted: function() {
    
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
    this.tasmota_toggle = this.$localStorage.get('tasmota_toggle');
    this.tasmota_status = this.$localStorage.get('tasmota_status');
    this.lighthandling = false;
    if(this.$localStorage.get('lighthandling') == "yes") {
      this.lighthandling = true;
    }
    this.led_ip = this.$localStorage.get('led_ip');
    this.led_toggle = this.$localStorage.get('led_toggle');
    this.led_status = this.$localStorage.get('led_status');
    this.cors_proxy = this.$localStorage.get('cors_proxy');
    if(this.$localStorage.get('theme') == null) {
      this.theme = "light";
    } else {
      this.theme = this.$localStorage.get('theme');
    }
  },
  methods: {
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
        cors_proxy: this.$localStorage.get('cors_proxy'),
        theme: this.$localStorage.get('theme')
      };
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:attachment/text,' + encodeURI(JSON.stringify(config));
      hiddenElement.target = '_blank';
      hiddenElement.download = 'octovue_config.txt';
      hiddenElement.click();
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
      this.$localStorage.set('theme', this.theme);
      this.$router.go();
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
          self.theme = json.theme;
      };
      readFile.readAsText(uploadedFile);
    },
    octoPrintCommand: function(action) {
      this.transport("POST", "octo_ip", "/api/system/commands/core/"+action, null).then(result => {});
    }
  },
  watch: {
    theme: function () {
      /*
      var values = [], keys = Object.keys(localStorage), i = keys.length;
      while ( i-- ) {
          values.push( {'key': keys[i], 'value': localStorage.getItem(keys[i])} );
      }
      console.log(values);
      */
     $("#theme").attr("href", "css/themes/"+this.theme+".css");
    }
  }
}
</script>

<style>
#settingsPage .field {
    margin-top: 20px;
}
#settingsPage .is-separate {
  border-bottom: 1px solid #C0C0C0;
  padding-bottom: 20px;
}
</style>