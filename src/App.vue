<template>
  <div id="app">
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
            <div class="control" id="control_power" v-if="$powerhandling == 'yes'">
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

            <div class="control" id="control_light" v-if="$lighthandling == 'yes'">
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
                  <span>
                    Terminal
                  </span>
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
            <p>Octoprint installation is required for OctoVue to work and control your printer. Just edit &quot;main.js&quot;, set &quot;Vue.prototype.$octo_ip&quot; to your octoprint ipaddress:port and set &quot;Vue.prototype.$apikey&quot; to your octoprint's api key.</p>
            <h3>Uploading files</h3>
            <p>Navigate to the destination folder and just drag and drop the gcode file into this browser window.<br />For now, only uploading to octoprint's local storage is used.</p>
            <h3>Printer power</h3>
            <p>For switching the printer on/off I use a &quot;Sonoff POW with tasmota firmware&quot;. If you plan the same/similar setup, edit &quot;main.js&quot;, set your sonoff's ip-address and set &quot;Vue.prototype.$powerhandling = yes&quot;.</p>
            <h3>Light control</h3>
            <p>For switching the enclosure lights on/off I use a &quot;nodemcu flashed with esphome&quot;, integrated into homeassistant. If you plan the same/similar setup, edit &quot;main.js&quot;, set your led-controlling-device's ip-address and set &quot;Vue.prototype.$lighthandling = yes&quot;.</p>
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
</template>

<script>

export default {
  linkActiveClass: 'is-active',
  props: {
    msg: String,
    txt: String
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
      url: "http://192.168.120.244:5000/api/files/local"
    });
  },
  mounted: function() {
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
