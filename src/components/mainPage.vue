<template>
  <div class="octovue">
    <div :class="{'is-active': pageLoader}" class="pageloader"><span class="title">connecting to OctoPrint instance<br /><span class="title" v-if="octoprintConnectionTries >= octoprintConnectionMaxTries">{{pageLoaderAddText}}</span></span></div>
    <article id="messagebox" class="message is-danger">
      <div id="messagebox_body" class="message-body"></div>
    </article>
    <div id="dropzoneProgress">
      <div class="imgContainer"><img src="img/upload.gif"></div>
      <div class="textContainer"><h3>uploading...</h3></div>
    </div>
    <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            OctoVue
          </a>
        </div>
        <div id="navbarBasicExample" class="navbar-menu">
          <div class="navbar-start" style="width: 50%;">
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
          </div>
          <div class="navbar-end">
            <div class="navbar-item">
              <div class="buttons">
                <a class="button is-info is-small" v-on:click="nav('stats');"  v-if="page != 'stats' || !page">Stats</a>
                <a class="button is-info is-small" v-on:click="nav('print')" v-if="page != 'print' || !page">Print page</a>
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




      <section class="section" id="mainPage" v-if="page == 'main' || !page">
        <div class="">

          <div class="columns">

            <div class="column is-one-fifth" v-if="printerState.payload.state_string == 'Printing' || printerState.payload.state_string == 'Paused' || printerState.payload.state_string == 'Pausing' || printerState.payload.state_string == 'Resuming'">
              <h2>{{job.printfile}}</h2>
              <progress class="progress is-link" v-bind:value="job.progress.completion" max="100"></progress>

              <table class="table is-fullwidth">
                <tbody>
                  <tr>
                    <td>Progress:</td>
                    <td>{{ formatDecimal(job.progress.completion) }}%</td>
                  </tr>
                  <tr>
                    <td>Printtime:</td>
                    <td>{{ formatTime(job.estimatedPrintTime) }}</td>
                  </tr>
                  <tr>
                    <td>Time elapsed:</td>
                    <td>{{ formatTime(job.progress.printTime) }}</td>
                  </tr>
                  <tr>
                    <td>Time left:</td>
                    <td>{{ formatTime(job.progress.printTimeLeft) }}</td>
                  </tr>
                  <!--
                  <tr v-if="job.filament.tool0.length != null">
                    <td>Filament</td>
                    <td>{{ formatLenght(job.filament.tool0.length ) }}</td>
                  </tr>
                  !-->
                  <tr>
                    <td>Height</td>
                    <td>{{ job.currentZ }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="buttons" id="fileoperations">
                <span id="btn_pause" class="button"  v-on:click="pauseJob()">pause</span>
                <span id="btn_resume" class="button"  v-on:click="resumeJob()">resume</span>
                <span id="btn_cancel" class="button"  v-on:click="cancelJob()">cancel</span>
              </div>

            </div>
            
            <div class="column is-three-fifth" v-if="file_origin == 'local' || file_origin == 'sdcard' || file_origin == 'thingiverse'">
              <h2>Files & Folders</h2>
              <table id="filebrowser_head" class="table is-fullwidth">
                <thead>
                  <tr colspan="3">
                    <td>
                      <div class="tabs is-centered is-boxed">
                        <ul>
                          <li id="tab_local" v-bind:class="{ 'is-active' : file_origin == 'local' }"><a v-on:click="changeFileSource('local')"> <i class="fas fa-hdd"></i>&nbsp;local</a></li>
                          <li id="tab_sdcard" v-bind:class="{ 'is-active' : file_origin == 'sdcard' }"><a v-on:click="changeFileSource('sdcard')"><i class="fas fa-sd-card"></i>&nbsp;sdcard</a></li>
                          <li id="tab_thingiverse" v-bind:class="{ 'is-active' : file_origin == 'thingiverse' }"><a v-on:click="changeFileSource('thingiverse');thingiverse_search()"><span class="thingiverse">T</span>&nbsp;thingiverse</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </thead>
              </table>

              <div v-if="file_origin == 'local' || file_origin == 'sdcard'">

                <div v-if="selectedfolder != ''" v-on:click="folderup()" style="text-align: left">&#x2190; back</div>
                <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
                  <tbody id="filesbody">
                    <tr v-on:click="selectFolder(folder.path)" v-for="folder in folders"><td><span class="icon">&#128193;</span></td><td>{{ folder.display }}</td><td></td></tr>
                    <tr v-on:click="selectFile($event, file)" v-for="file in files">
                      <td>
                        <figure v-if="$previewimages == 'yes'" class="image is-128x128"><img :src="file.img" :id="file.thumbid" class="thumb" @error="imgFallback" v-on:mousemove="zoomIn($event, file.thumbid, 'overlay_'+file.imgid)" v-on:mouseleave="zoomOut(''+file.imgid)"></figure>
                        <div class="overlay_wrapper">
                          <div :id="'overlay_'+file.imgid" class="zoomoverlay" v-bind:style="{'background-image': 'url(' + file.img + ')' }"></div>
                        </div>
                      </td>
                      <td>
                        {{ file.display }}<br />
                        <div style="width: 130px; float:left; margin-left: 20px;" v-if="file.gcodeAnalysis.dimensions.width != null">Dimensions:</div><div v-if="file.gcodeAnalysis.dimensions.width != null">x: {{ formatLenght(file.gcodeAnalysis.dimensions.width) }} y: {{ formatLenght(file.gcodeAnalysis.dimensions.depth) }} z: {{ formatLenght(file.gcodeAnalysis.dimensions.height) }}</div>
                        <div style="width: 130px; float:left; margin-left: 20px;" v-if="file.gcodeAnalysis.estimatedPrintTime != null">PrintTime:</div><div v-if="file.gcodeAnalysis.estimatedPrintTime != null">{{ formatTime(file.gcodeAnalysis.estimatedPrintTime) }}</div>
                        <div style="width: 130px; float:left; margin-left: 20px;" v-if="file.gcodeAnalysis.filament.tool0 != null && file.gcodeAnalysis.filament.tool0.length != null">Filament:</div><div v-if="file.gcodeAnalysis.filament.tool0 != null && file.gcodeAnalysis.filament.tool0.length != null">{{ formatLenght(file.gcodeAnalysis.filament.tool0.length) }}</div>
                        <div style="width: 130px; float:left; margin-left: 20px;" v-if="file.prints != null">Prints ok/nok:</div><div v-if="file.prints != null">{{ file.prints.success }} / {{ file.prints.failure }}</div>
                      </td>
                      <td>{{file.hr_date}} 
                        <div class="file_buttons" :id="'fb_'+file.imgid">
                          <!-- <span id="btn_load" class="button is-warning is-small" disabled v-on:click="loadprintFile(false)">load</span> !-->
                          <span id="btn_print" class="button is-success is-small" disabled v-on:click="loadprintFile(true)">print</span> 
                          <span id="btn_delete" class="button is-danger is-small" disabled v-on:click="deleteFile()">delete</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="file_origin == 'thingiverse'">
                <div class="columns is-vcentered" style="margin-bottom: 30px;">
                  <div class="field has-addons" style="margin: 0 auto;">
                    <div class="control">
                      <input class="input" type="text" placeholder="search thingiverse" v-model="q" v-on:keyup.enter="thingiverse_search()">
                    </div>
                    <div class="control" v-on:click="thingiverse_search()">
                      <a class="button is-info">
                        Search
                      </a>
                    </div>
                  </div>
                </div>

                <div v-if="thingiverse_results.length < 1 && searchLoader">
                  <img src="img/upload.gif"><br />loading...
                </div>
                <div v-if="thingiverse_results.length < 1 && !searchLoader">
                  nothing found
                </div>
                <div v-if="thingiverse_results.length > 0">
                  <table class="table is-fullwidth">
                    <tr v-if="thingiverse_results.length <= 12">
                      <td colspan="3" style="text-align: center">
                        <span v-if="thingpage > 1" id="btn_page" class="button is-small" v-on:click="prevPage();thingiverse_search()">prev page</span>
                        <span v-if="thingiverse_results.length == 12" id="btn_page" class="button is-small" style="margin-left: 20px;" v-on:click="nextPage();thingiverse_search()">next page</span>
                      </td>
                    </tr>
                  </table>
                  <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
                    <tbody id="filesbody" v-if="thingiverse_results.length">
                      <tr v-for="file in thingiverse_results">
                        <td>
                          <figure class="image is-128x128" v-on:click="windowOpen(file.public_url)" style="cursor: pointer;"><img :src="file.thumbnail" :id="'thumb_'+file.id" class="thumb" @error="imgFallback"></figure>
                        </td>
                        <td>
                          {{ file.name }}<br />
                          Creator: <a v-bind:href="file.creator.public_url" target="_blank">{{ file.creator.name }} <span v-if="file.creator.first_name || file.creator.last_name">({{ file.creator.first_name }}<span v-if="file.creator.first_name && file.creator.last_name">&nbsp;</span>{{ file.creator.last_name }})</span></a>
                        </td>
                        <td>
                          <div class="file_buttons_thingiverse" :id="'fb_'+file.id">
                            <span id="btn_thing_show" class="button is-success is-small" v-on:click="windowOpen(file.public_url)">show</span> 
                            <span id="btn:thing_download" class="button is-success is-small" v-on:click="downloadThingFile(file.id, file.name)">save</span> 
                          </div>                        
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="table is-fullwidth">
                    <tr v-if="thingiverse_results.length <= 12">
                      <td colspan="3" style="text-align: center">
                        <span v-if="thingpage > 1" id="btn_page" class="button is-small" v-on:click="prevPage();thingiverse_search()">prev page</span>
                        <span v-if="thingiverse_results.length == 12" id="btn_page" class="button is-small" style="margin-left: 20px;" v-on:click="nextPage();thingiverse_search()">next page</span>
                      </td>
                    </tr>
                  </table>
                </div>

              </div>

            </div>

            <div class="column is-one-fifth">
              <div class="card">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img :src="cam"  @error="imgFallback" alt="Printer image">
                  </figure>
                </div>
                <div class="card-content">
                  <div class="media">

                    <div class="media-content">
                      <p class="title is-4" id="printername" v-if="connectionSettings.options.printerProfiles.length">{{ connectionSettings.options.printerProfiles[0].name }}</p>
                      <p class="subtitle is-6" id="connectionstatus">{{ printerState.payload.state_string }}</p>
                    </div>
                  </div>

                  <transition name="slide">
                    <div id="transitionWrapper">
                      <div class="content" id="cardprinterstatus" v-if="printerState.payload.state_string != 'Offline'">
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
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="printPage" v-if="page == 'print'">
        
        <section class="hero is-small is-bold" style="max-height: 80px; margin-bottom: 20px;" v-if="page == 'print'">
          <div class="hero-body" style="padding: none !important; text-align: left !important;">
            <div class="container">
                <div style="float: left; margin-right: 40%;" v-on:click="nav('')">
                  <i class="fas fa-chevron-left fa-3x" style="cursor: pointer; position: relative; top: -8px;"></i>
                </div>
                <div class="title" v-if="connectionSettings.options.printerProfiles[0].name">
                  {{ connectionSettings.options.printerProfiles[0].name }}
                </div>
              </div>
          </div>
        </section>

        <div class="columns" id="printPage">
          <div class="column is-one-third">
            <figure class="image is-5by4">
                  <img :src="cam"  @error="imgFallback" alt="Printer image">
                </figure>
          </div>
          <div class="column is-two-third">
            
          <h3>{{job.printfile}}</h3>

          <div class="columns" style="padding-top: 70px;">
            <div class="column is-one-third pp_boxes">
              <img src="img/layer-time-average-icon2.png" style="height: 46px"><br />
              {{ formatTimeRemaining(job.progress.printTimeLeft) }}
            </div>
            <div class="column is-one-third pp_boxes">
              <img src="img/layers-icon2.png" style="height: 46px"><br />
              {{currentLayer}} / {{totalLayer}}
            </div>
            <div class="column is-one-third pp_boxes">
              <img src="img/layer_height.png" style="height: 46px"><br />
              {{formatDecimal(currentHeight)}} / {{formatDecimal(totalHeight)}} mm
            </div>
          </div>

          <div style="text-align: right; margin-top: 50px;" class="pp_boxes">{{formatDecimal(job.progress.completion)}}%</div>
          <progress class="progress is-primary" v-bind:value="job.progress.completion" max="100"></progress>

          <div class="buttons" id="fileoperations" style="margin-top: 30px;">
            <div style="width: 50%; padding: 10px;">
              <span id="btn_pause" class="button is-fullwidth"  v-bind:disabled="this.printerState.payload.state_string != 'Printing'" v-if="printerState.payload.state_string != 'Paused'" v-on:click="pauseJob()">pause</span>
              <span id="btn_resume" class="button is-fullwidth" v-bind:disabled="this.printerState.payload.state_string != 'Printing'" v-if="printerState.payload.state_string == 'Paused'" v-on:click="resumeJob()">resume</span>
            </div>
            <div style="width: 50%;">
              <span id="btn_cancel" class="button is-fullwidth is-danger" v-bind:disabled="this.printerState.payload.state_string != 'Printing'" v-on:click="cancelJob()">cancel</span>
            </div>
          </div>
          </div>
              
        </div>

        <div class="columns" id="printPage_temp">
          <div class="column is-half" style="padding: 0 50px 0 0">
            <chart ref="tempchart" :type="'line'" v-bind:data="line_temps" :options="line_temps_options"></chart>
          </div>
          
          <div class="column is-half" id="piecharts">
            <div class="columns">
              <div class="column is-half">
                <chart ref="tool0chart" :type="'pie'" v-bind:data="pie_tool0" :options="pie_tool0_options"></chart>
                <div style="font-size: 1.8em; font-weight: bold; position: relative; top: -145px;"><img src="img/hotend-icon2.png" style="width: 40px;"><br />{{ temps.tool0.actual }}&deg;C</div>
              </div>
              <div class="column is-half">
                <chart ref="bedchart" :type="'pie'" v-bind:data="pie_bed" :options="pie_bed_options"></chart>
                <div style="font-size: 1.8em; font-weight: bold; position: relative; top: -145px;"><img src="img/bed-icon2.png" style="width: 40px;"><br />{{ temps.bed.actual }}&deg;C</div>
              </div>
            </div>
          </div>
          
        </div>

      </section>

      <section class="section" id="statPage" v-if="page == 'stats'">

        <section class="hero is-small is-bold" style="max-height: 80px; margin-bottom: 20px;">
          <div class="hero-body" style="padding: none !important; text-align: left !important;">
            <div class="container">
                <div style="float: left; margin-right: 40%;" v-on:click="nav('')">
                  <i class="fas fa-chevron-left fa-3x" style="cursor: pointer; position: relative; top: -8px;"></i>
                </div>
                <div class="title">
                  Stats
                </div>
              </div>
          </div>
        </section>

        <div class="columns" style="padding-top: 10px;">
            <div class="column is-one-fiths">
              <chart ref="pie_stats_printing" :type="'pie'" v-bind:data="pie_stats_printing" :options="pie_stats_printing_options"></chart>
            </div>
            <div class="column is-four-fifths">


              <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>Filename</th>
                    <th><i class="fas fa-thumbs-up" style="color: #31cf65;"></i></th>
                    <th><i class="fas fa-thumbs-down" style="color: #fc3c63;"></i></th>
                    <th>last printdate</th>
                    <th>last print</th>
                  </tr>
                </thead>
                <tbody id="filesbody">
                  <tr v-for="entry in printhistory">
                    <td>
                      <figure v-if="$previewimages == 'yes'" class="image is-64x64"><img :src="entry.file.img" :id="entry.file.thumbid" class="thumb" @error="imgFallback" v-on:mousemove="zoomIn($event, entry.file.thumbid, 'overlay_'+entry.file.imgid)" v-on:mouseleave="zoomOut(''+entry.file.imgid)"></figure>
                      <div class="overlay_wrapper">
                        <div :id="'overlay_'+entry.file.imgid" class="zoomoverlay" v-bind:style="{'background-image': 'url(' + entry.file.img + ')' }"></div>
                      </div>
                    </td>
                    <td>{{formatShorten(entry.file.name, 30)}}</td>
                    <td>{{entry.file.prints.success}}</td>
                    <td>{{entry.file.prints.failure}}</td>
                    <td>{{formatDate(entry.date)}}</td>
                    <td>
                      <i class="fas" :class="{'fa-thumbs-up': entry.file.prints.last.success}" v-if="entry.file.prints.last.success" style="color: #31cf65;"></i>
                      <i class="fas" :class="{'fa-thumbs-down': !entry.file.prints.last.success}" v-if="!entry.file.prints.last.success" style="color: #fc3c63;"></i>
                    </td>
                  </tr>
                </tbody>
              </table>



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
//import jQuery from 'jquery';
//import setimmediate from 'setimmediate';
import Chart from 'vue-bulma-chartjs';

export default {
  name: 'mainPage',
  props: {
    msg: String,
    txt: String
  },
  components: {
    Chart
  },
  created:function(){
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
  mounted:function() {
    setTimeout(this.loadCam, 500)
    setTimeout(this.getPowerState, 1)
    setTimeout(this.getLightState, 1)
    setTimeout(this.loadFiles, 1)
    setTimeout(this.getOctoprintConnection, 1)
    setTimeout(this.sockConnection, 2);
    if(this.printerState.payload.state_string != "Operational" && this.printerState.payload.state_string != "Connecting" && this.printerState.payload.state_string != "Paused") {
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
  },
  data() {
    return {
      powerhandling: "",
      lighthandling: "",
      temp: [20, 80],
      page: '',
      infomodal: false,
      terminalmodal: false,
      printerState: {"type": "PrinterStateChanged", "payload":{"state_string":"Offline","state_id":"OFFLINE"}},
      temps: {"bed":{"actual":"0","target":"0"}, "chamber":{"actual":"0","target":"0"}, "tool0":{"actual":"0","target":"0"}, "time": "0"},
      logs: {},
      cam: "",
      powerState: "off",
      lightState: "off",
      connectionState: "off",
      connectionSettings: {"options": {"printerProfiles": []}},
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
      currentLayer: 0,
      totalLayer: 0,
      currentHeight: 0,
      totalHeight: 0,
      file_origin: "local",
      searchLoader: false,
      pageLoader: true,
      pageLoaderAddText: "",
      octoprintConnectionTries: 0,
      octoprintConnectionMaxTries: 4,
      printhistory: [],
      job: {"printfile": "", "estimatedPrintTime": "", "currentZ": "", "progress":{"completion": "", "filepos": "", "printTime": "", "printTimeLeft": "", "filament": {"tool0": {"length": "", "volume": ""}}}},
      thingiverse_results: [],
      q: "",
      thingpage: 1,
      stats: {"success": 0, "failed": 0},
      pie_tool0: {
        datasets: [{
          data: [0, 250],
          backgroundColor: [
            '#fc3c63',
            '#C0C0C0'
          ]
        }]
      },
      pie_tool0_options: {
        segmentShowStroke: false,
        circumference: 1 * Math.PI,
        rotation: 1 * Math.PI,
        cutoutPercentage: 80
      },
      pie_bed: {
        datasets: [{
          data: [0, 90],
          backgroundColor: [
            '#2b9eeb',
            '#C0C0C0'
          ]
        }]
      },
      pie_bed_options: {
        segmentShowStroke: false,
        circumference: 1 * Math.PI,
        rotation: 1 * Math.PI,
        cutoutPercentage: 80
      },
      line_temps: {
        labels: [''],
        datasets: [{
          label: 'Extruder I',
          fill: false,
          backgroundColor: '#fc3c63',
          borderColor: '#fc3c63',
          borderWidth: 2,
          data: [0],
        },
        {
          label: 'Extruder S',
          fill: false,
          backgroundColor: '#fab3c2',
          borderColor: '#fab3c2',
          borderWidth: 6,
          data: [0],
        },
        {
          label: 'Bed I',
          fill: false,
          backgroundColor: '#2b9eeb',
          borderColor: '#2b9eeb',
          borderWidth: 2,
          data: [0],
        },
        {
          label: 'Bed S',
          fill: false,
          backgroundColor: '#99d3fa',
          borderColor: '#99d3fa',
          borderWidth: 6,
          data: [0],
        }]
      },
      line_temps_options: {
        elements: {
          point:{
            radius: 0
          }
        },
        responsive: true,
				title: {
					display: false
				},
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: false,
							labelString: ''
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Temperature'
						}
					}]
        },
      },
      pie_stats_printing: {
        datasets: [{
          data: [0, 0],
          backgroundColor: [
            '#31cf65',
            '#fc3c63'
          ]
        }],
        labels: ['successful', 'failed']
      },
      pie_stats_printing_options: {
        segmentShowStroke: false,
        responsive: true
      },
      dropzoneOptions: {
        url: 'http://192.168.120.244:5000/api/files/local',
        thumbnailWidth: 150,
        maxFilesize: 100,
        headers: { "My-Awesome-Header": "header value" }
      },
    }
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
      var sock = new SockJS(this.$octo_ip+'/sockjs');
      const client = new StompJs.Client({
        brokerURL: "ws://127.0.0.1/sockjs", //dummy
        reconnectDelay: 2000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      client.webSocketFactory = function () {
        sock = new SockJS(self.$octo_ip+'/sockjs');
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
                  this.printerState = msg.event;
                  if(this.printerState.payload.state_string != "Operational" && this.printerState.payload.state_string != "Connecting" && this.printerState.payload.state_string != "Paused") {
                    this.isNotConnection = true;
                    this.isConnection = false;
                    this.isConnecting = false;
                    this.connectionState = "off";
                  } else if(this.printerState.payload.state_string == "Connecting") {
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
              }
              if(msg.event.type == "DisplayLayerProgress_layerChanged" || msg.event.type == "DisplayLayerProgress_heightChanged") {
                this.totalLayer = msg.payload.totalLayer;
                this.currentLayer = msg.payload.currentLayer;
                this.totalHeight = msg.payload.totalHeightWithExtrusion;
                this.currentHeight = msg.payload.currentHeight;
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
            this.currentLayer = msg.plugin.data.stateMessage.split(" / ")[0];
            this.totalLayer = msg.plugin.data.stateMessage.split(" / ")[1];
          }
          if(msg.plugin.data.heightMessage != null) {
            this.currentHeight = msg.plugin.data.heightMessage.split("/")[0];
            this.totalHeight = msg.plugin.data.heightMessage.split("/")[1].replace(/mm/i, '');
          }
        }
      }
      if(msg.current != null) {
        if(msg.current.temps != null) {
          if(msg.current.temps.length != 0) {
            if(msg.current.temps[0].tool0 != null) {
              this.temps = msg.current.temps[0];
              var temptool0_ist = (100/this.temps.tool0.target)*this.temps.tool0.actual;
              $("#temp_tool0_actual").css("height", temptool0_ist+"%");
              var tempbed_ist = (100/this.temps.bed.target)*this.temps.bed.actual;
              $("#temp_bed_actual").css("height", tempbed_ist+"%");
              this.updateGauge(this.temps.tool0.actual, this.temps.bed.actual);
              this.updateTempChart(this.temps.tool0.actual, this.temps.tool0.target, this.temps.bed.actual,  this.temps.bed.target);
            }
          }
        }
        if(msg.current.logs != null) {
          for(var i=0;i<msg.current.logs.length;i++) {
            if(msg.current.logs[i].includes("M117")) {
              const regex = /[0-9]*\/[0-9]*/g;
              var layers = msg.current.logs[i].match(regex);
              if(layers != null && layers.length > 0) {
                this.currentLayer = layers[0].split("/")[0];
                this.totalLayer = layers[0].split("/")[1];
              }
            }
            if(msg.current.logs[i].includes("G1")) {
              if(msg.current.logs[i].includes("Z")) {
                const regex = /Z[0-9]*\.[0-9]*/g;
                var height = msg.current.logs[i].match(regex);
                if(height != null && height.length > 0) {
                  this.currentHeight = height[0].split("Z")[1];
                  //this.totalH = height[0].split("/")[1];
                }
              }
            }

            if(this.logs.length > 500) {
              this.logs = this.logs.splice(-500, 500)
            }
            this.logs.push(msg.current.logs[i])
          }
        }
        if(msg.current.state != null) {
          this.printerState.payload.state_string = msg.current.state.text;
          if(this.printerState.payload.state_string != "Operational" && this.printerState.payload.state_string != "Connecting" && this.printerState.payload.state_string != "Cancelling" && this.printerState.payload.state_string != "Paused") {
            this.isNotConnection = true;
            this.isConnection = false;
            this.isConnecting = false;
            this.connectionState = "off";
          } else if(this.printerState.payload.state_string == "Connecting") {
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
        }
        if(msg.current.state.text == "Printing" && msg.current.busyFiles.length > 0) {
          this.job.printfile = msg.current.busyFiles[0].path;
          this.job.progress = msg.current.progress;
          this.job.filament = msg.current.job.filament;
          this.job.estimatedPrintTime = msg.current.job.estimatedPrintTime;
          this.job.currentZ = msg.current.currentZ;
        }
      }
      if(msg.history != null) {
        if(msg.history.logs != null) {
          if(msg.history.logs.length != 0) {
            this.logs = msg.history.logs
          }
        }
        if(msg.history.temps != null) {
          if(msg.history.temps.length > 0) {
            //this.temps = msg.history.temps[msg.history.temps.length-1]
          }
        }
        if(msg.history.state != null) {
          this.printerState = {"type": "PrinterStateChanged", "payload":{"state_string": msg.history.state.text,"state_id":""}}
        }
      }
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
      if(this.$powerhandling == "yes") {
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
      }
    },
    lightswitch: function() {
      axios({ method: "POST", "url": this.$cors_proxy+"/"+this.$led_ip+"/light/3d_drucker_led/toggle" }).then(result => {
        this.getLightState();
      }, error => {
        console.error(error);
      });
    },
    getLightState: function() {
      if(this.$lighthandling == "yes") {
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
      }
    },
    printerConnection: function() {
      var obj = {};
      if(this.isNotConnection) {
        obj.command = "connect";
        obj.port = this.$port;
        obj.baudrate = this.$baudrate;
        obj.printerProfile = this.$printerProfile;
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
    getOctoprintConnection: function() {
      var self = this;
      axios({ method: "GET", "url": this.$octo_ip+"/api/connection", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        self.connectionSettings = result.data;
        self.pageLoader = false;
      }, error => {
          self.displayMsg('octoprint_conn_error');
          console.error(error);
          if(self.octoprintConnectionTries < self.octoprintConnectionMaxTries) {
            setTimeout(function(){
              self.octoprintConnectionTries = self.octoprintConnectionTries + 1;
              self.getOctoprintConnection();
            }, 1000);
          } else {
            self.pageLoaderAddText = "Connection failed, seems like OctoPrint server is not available!?";
          }
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
      this.selectedfolder = this.selectedfolder.substring(0, this.selectedfolder.lastIndexOf('/'));
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
      axios({ method: "GET", "url": this.$octo_ip+"/api/files?recursive=true", headers: {'X-Api-Key': this.$apikey} }).then(result => {
        this.fileList = [];
        this.fileList = result.data.files;
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
          for(var n=1;n<path.length;n++) {
            for(var m=0;m<pathobj.children.length;m++) {
              if(pathobj.children[m].path == this.selectedfolder) {
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
              this.folders.push(pathobj.children[i]);
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
              this.files.push(pathobj.children[i]);
            }
          }
        }
      } else { // Main folder
        for (i = 0; i < this.fileList.length; i++) {
          if(this.fileList[i].origin == this.file_origin) {
            if(this.fileList[i].type == "folder") {
              self.folders.push(this.fileList[i]);
            } else if(this.fileList[i].type == "machinecode") {
              if(this.fileList[i].refs.resource != null) {
                if(self.file_origin == "local" && this.fileList[i].refs.resource.includes(".gcode")) {
                  img = this.fileList[i].refs.download.replace(".gcode", ".png");
                  download = this.fileList[i].refs.download;
                }

                if(self.file_origin == "sdcard" && this.fileList[i].refs.resource.includes(".gco")) {
                  img = this.fileList[i].refs.resource.replace(".gco", ".png");
                  download = this.fileList[i].refs.resource;
                }
                imgid = this.fileList[i].display.replace(".", "");
                if(this.fileList[i].date != null) {
                  tstamp = new Date(this.fileList[i].date*1000);
                  day = "0"+tstamp.getDate();
                  month = "0"+tstamp.getMonth();
                  date = day.slice(-2)+"."+month.slice(-2)+"."+tstamp.getFullYear();
                } else {
                  date = "";
                }
                this.fileList[i].download = download;
                this.fileList[i].img = img;
                this.fileList[i].imgid = imgid;
                this.fileList[i].thumbid = "thumb_"+imgid;
                this.fileList[i].hr_date = date;
                if(this.fileList[i].gcodeAnalysis == null) {
                  this.fileList[i].gcodeAnalysis = {};
                  this.fileList[i].gcodeAnalysis.estimatedPrintTime = null;
                  this.fileList[i].gcodeAnalysis.filament = {"tool0": {"length": null, "volume": null}};
                  this.fileList[i].gcodeAnalysis.printingArea = {"maxX": null, "maxY": null, "maxZ": null, "minX": null, "minY": null, "minZ": null};
                }
                if(this.fileList[i].gcodeAnalysis.dimensions == null) {
                  this.fileList[i].gcodeAnalysis.dimensions = {"width": null, "depth": null, "height": null};
                }
              }
              this.files.push(this.fileList[i]);
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
      var url = this.$octo_ip+"/api/files/"+this.selectedfile.origin+"/"+this.selectedfile.display;
      var obj = {};
      obj.command = "select";
      obj.print = print;

      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        if(print) {
          $('#btn_cancel').attr("disabled", false);
          this.nav('print');
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
      }, error => {
          console.error(error);
      });
    },
    cancelJob: function() {
      var url = this.$octo_ip+"/api/job";
      var obj = {};
      obj.command = "cancel";
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then(result => {
        $('#btn_cancel').attr("disabled", true);
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
    setExtruderTemp: function() {
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
      axios({ method: "POST", url: url, headers: {'X-Api-Key': this.$apikey, 'Content-Type': 'application/json;charset=UTF-8'}, data: JSON.stringify(obj) }).then({
      }, error => {
          console.error(error);
      });
    },
    windowOpen: function(url) {
      window.open(url, "_blank"); 
    },
    thingiverse_search: function() {
      this.searchLoader = true;
      var url;
      var q;
      if(this.q == "") {
        q = this.q.replace(" ", "%2B");
        url = "http://cststudios.de/thingiverse/?action=init";
        axios({ method: "GET", url: url}).then(result => {
          this.thingiverse_results = result.data;
          this.searchLoader = false;
        }, error => {
            console.error(error);
            this.searchLoader = false;
        });
      } else {
        q = this.q.replace(" ", "%2B");
        url = "http://cststudios.de/thingiverse/?action=search&q="+q+"&page="+this.thingpage;
        axios({ method: "GET", url: url}).then(result => {
          this.thingiverse_results = result.data;
          this.searchLoader = false;
        }, error => {
            console.error(error);
            this.searchLoader = false;
        });
      }
      
    },
    downloadThingFile: function(id, name) {
      name = name.replace(/ /g, "_").replace(/\\/g, "_");
      var url = "http://cststudios.de/thingiverse/?action=download&thingid="+id+"&thingname="+name;
      window.open(url, "_blank");
    },
    prevPage: function() {
      this.thingpage = this.thingpage -1;
    },
    nextPage: function() {
      this.thingpage = this.thingpage +1;
    },
    nav: function(page) {
      this.page = page;
    },
    updateGauge: function(tool0temp, bedtemp) {
      var tool0temp_percent = (100/250)*parseInt(tool0temp);
      var bedtemp_percent = (100/90)*parseInt(bedtemp);
      this.pie_tool0.datasets[0].data = [tool0temp_percent, 100-tool0temp_percent];
      this.pie_bed.datasets[0].data = [bedtemp_percent, 100-bedtemp_percent];
      if(this.$refs.tool0chart) {
        this.$refs.tool0chart.chart.update();
        this.$refs.bedchart.chart.update();
      }
    },
    updateTempChart: function(tool0_ist, tool0_soll, bed_ist, bed_soll) {
      this.line_temps.datasets[0].data.push({x:this.line_temps.datasets[0].data.length+1, y:parseInt(tool0_ist)});
      this.line_temps.datasets[1].data.push({x:this.line_temps.datasets[1].data.length+1, y:parseInt(tool0_soll)});
      this.line_temps.datasets[2].data.push({x:this.line_temps.datasets[2].data.length+1, y:parseInt(bed_ist)});
      this.line_temps.datasets[3].data.push({x:this.line_temps.datasets[3].data.length+1, y:parseInt(bed_soll)});
      this.line_temps.labels.push('');
      if(this.$refs.tempchart) {
        this.$refs.tempchart.chart.update();
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
        default:
          console.log("unhandled msg error");
      }
    },
    getStats: function() {
      var s = 0;
      var f = 0;
      var img;
      var imgid;
      for(var i = 0; i<this.fileList.length;i++) {
        var obj = this.fileList[i];
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
                this.printhistory.push({"date": obj.prints.last.date.toString().split(".")[0], "file": obj});
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
                    this.printhistory.push({"date": obj.children[n].prints.last.date.toString().split(".")[0], "file": obj.children[n]});
                  }
                }
              }
            }
          }
        }
      }
      this.printhistory.sort(this.compare);
      this.stats.success = s;
      this.stats.failure = f;
      this.pie_stats_printing.datasets[0].data = [s, f];
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
    }
  },
  computed: {
    terminalLogs: {
      get() {
        if(this.logs.length > 0) {
          return this.logs.join('\n')
        }
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
