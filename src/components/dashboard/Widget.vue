<template>
  <div v-if="type == 'pie-chart'">
    <chart class="piechart dragSelector"  :ref="reference" :type="'pie'" :data="widgetData" :options="widgetOptions"></chart>
    <div class="missing dragSelector" v-if="widgetData == null">{{source}} not found</div>
  </div>
  
  <chart v-else-if="type == 'line-chart'" class="linechart" :ref="reference" :type="'line'" :data="widgetData" :options="widgetOptions"></chart>
    
  <div class="image-container" v-else-if="type == 'image-container'" :style="{ backgroundImage: 'url(\'' + widgetData + '\')' }"></div>

  <div class="gauge dragSelector" v-else-if="type == 'gauge'" :id="id">
    <chart :ref="reference" :type="'pie'" v-bind:data="widgetData" :options="widgetOptions" class="dragSelector gaugeChart"></chart>
    <div class="gaugeFooter">
      <div class="gauge_value dragSelector">{{this.value}}</div>
      <div class="gauge_label dragSelector"><img :src="imgsrc">{{this.source}}</div>
    </div>
    <div class="missing dragSelector" v-if="widgetData == null">{{source}} not found</div>
  </div>

  <div class="widgetlabel dragSelector" :id="id" v-else-if="type == 'label'">
    {{ widgetData }}<div class="source">{{this.source}}</div>
    <div class="missing dragSelector" v-if="widgetData == null">{{source}} not found</div>
  </div>

  <div :id="id" v-else-if="type == 'tempcontrol'" class="tempcontrol dragSelector">
    <div v-if="graphs.length <= 2" class="dragSelector">
      <div v-for="graph in graphs" v-if="graph.name != 'bed' && graph.name != 'chamber'" style="text-align: left;" class="dragSelector" v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}">
        <div style="width: 25%; float: left; text-align: center;">
            {{graph.name}}<br />
            <input :id="'slider'+graph.name" class="slider is-fullwidth is-danger is-small is-circle has-output" step="1" min="0" max="290" v-on:mouseup="setExtruderTemp(graph.name)" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px; padding: 3px;" v-bind:for="'slider'+graph.name" v-if="temps[graph.name].target">{{ temps[graph.name].target }}</output>
        </div>
        <div style="width: 25%; float: left; text-align: center;">
            <p>&nbsp;</p>
            <div class="temp_ist"><div :id="'temp_'+graph.name+'_actual'"></div></div>
        </div>
      </div>
      <div v-for="graph in graphs" v-if="graph.name == 'bed'" style="text-align: left;" class="dragSelector" v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}">
      <div style="width: 25%; float: left; text-align: center;" class="dragSelector">
              {{graph.name}}<br />
              <input :id="'slider'+graph.name" class="slider is-fullwidth is-info is-circle has-output" step="1" min="0" max="100" v-on:mouseup="setBedTemp()" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px; padding: 3px;" v-bind:for="'slider'+graph.name" v-if="temps[graph.name].target">{{ temps[graph.name].target }}</output>
          </div>
          <div style="width: 25%; float: left; text-align: center;">
              <p>&nbsp;</p>
              <div class="temp_ist"><div :id="'temp_'+graph.name+'_actual'"></div></div>
          </div>
      </div>
      <div v-for="graph in graphs" v-if="graph.name == 'chamber'" style="text-align: left;" class="dragSelector" v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}">
          <div style="width: 25%; float: left; text-align: center;" class="dragSelector">
              {{graph.name}}<br />
              <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="50" v-on:mouseup="setChamberTemp()" v-bind:value="temps[graph.name].target" type="range" ><output style="position: relative; top: 8px; padding: 3px;" v-bind:for="'slider'+graph.name" v-if="temps[graph.name].target">{{ temps[graph.name].target }}</output>
          </div>
          <div style="width: 25%; float: left; text-align: center;">
              <p>&nbsp;</p>
              <div class="temp_ist"><div :id="'temp_'+graph.name+'_actual'"></div></div>
          </div>
      </div>
    </div>

    <div v-if="graphs.length > 2" style="" class="dragSelector">
      <div v-for="graph in graphs" v-if="graph.name != 'bed' && graph.name != 'chamber'" style="text-align: center; float: left; font-weight: bold;" class="dragSelector" v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}">
          {{graph.name}}<br />
          <input v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}" :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="290" v-on:mouseup="setExtruderTemp(graph.name)" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px;" v-bind:for="'slider'+graph.name" v-if="temps[graph.name].target">{{ temps[graph.name].target }}</output><br />
      </div>
      <div v-for="graph in graphs" v-if="graph.name == 'bed'" style="text-align: center; float: left; font-weight: bold;" class="dragSelector" v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}">
          {{graph.name}}<br />
          <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="100" v-on:mouseup="setBedTemp()" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px;" v-bind:for="'slider'+graph.name" v-if="temps[graph.name].target">{{ temps[graph.name].target }}</output>
      </div>
      <div v-for="graph in graphs" v-if="graph.name == 'chamber'" style="text-align: center; float: left; font-weight: bold;" class="dragSelector" v-bind:style="{'color': graph.datasets[0].backgroundColor[0]}">
          {{graph.name}}<br />
          <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="50" v-on:mouseup="setChamberTemp()" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px;" v-bind:for="'slider'+graph.name" v-if="temps[graph.name].target">{{ temps[graph.name].target }}</output>
      </div>
    </div>
    
  </div>

  <div class="jobstatus dragSelector" :id="id" v-else-if="type == 'jobstatus'">
  	<h3>{{job.printfile}}</h3>
  	<div style="text-align: right;" class="">{{formatDecimal(job.progress.completion)}}%</div>
    <progress class="progress is-primary" v-bind:value="job.progress.completion" max="100"></progress>
    <div class="columns dragSelector">
      <div class="column is-one-third pp_boxes dragSelector">
        <img src="img/layer-time-average-icon2.png" style="height: 46px"><br />
        {{ formatTimeRemaining(job.progress.printTimeLeft) }}
      </div>
      <div class="column is-one-third pp_boxes dragSelector">
        <img src="img/layers-icon2.png" style="height: 46px"><br />
        {{currentLayer}} / {{totalLayer}}
      </div>
      <div class="column is-one-third pp_boxes dragSelector">
        <img src="img/layer_height.png" style="height: 46px"><br />
        {{formatDecimal(currentHeight)}} / {{formatDecimal(totalHeight)}} mm
      </div>
    </div>
  </div>

  <div class="printhead ctrlbuttons dragSelector" v-else-if="type == 'printhead'">
    <div class="center">
      <div class="horizontal dragSelector">
        <table>
          <tr>
            <td colspan="3" style="text-align: center">X / Y</td>
          </tr>
          <tr>
            <td class="dragSelector"></td>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('jog', 0, steps, 0)"><i class="fas fa-arrow-up"></i></span></td>
            <td class="dragSelector"></td>
          </tr>
          <tr>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('jog', '-'+steps, 0, 0)"><i class="fas fa-arrow-left"></i></span></td>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('home', null, null, null, ['x', 'y'])"><i class="fas fa-home"></i></span></td>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('jog', steps, 0, 0)"><i class="fas fa-arrow-right"></i></span></td>
          </tr>
          <tr>
            <td class="dragSelector"></td>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('jog', 0, '-'+steps, 0)"><i class="fas fa-arrow-down"></i></span></td>
            <td class="dragSelector"></td>
          </tr>
        </table>
      </div>
      <div class="horizontal dragSelector">
        <table>
          <tr>
            <td colspan="3" style="text-align: center">Z</td>
          </tr>
          <tr>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('jog', 0, 0, steps)"><i class="fas fa-arrow-up"></i></span></td>
          </tr>
          <tr>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('home', null, null, null, ['z'])"><i class="fas fa-home"></i></span></td>
          </tr>
          <tr>
            <td class="dragSelector"><span class="button ctrlbutton" v-on:click="printHead('jog', 0, 0, '-'+steps)"><i class="fas fa-arrow-down"></i></span></td>
          </tr>
        </table>
      </div>
    </div>
    <div class="field has-addons vertical dragSelector">
      <p class="control">
        <button class="button is-small is-primary" v-bind:class="{ 'is-active' : steps == 0.1, 'is-outlined' : steps != 0.1}" v-on:click="steps = 0.1">
          <span>0.1</span>
        </button>
      </p>
      <p class="control">
        <button class="button is-small is-primary" v-bind:class="{ 'is-active' : steps == 1, 'is-outlined' : steps != 1}" v-on:click="steps = 1">
          <span>1</span>
        </button>
      </p>
      <p class="control">
        <button class="button is-small is-primary" v-bind:class="{ 'is-active' : steps == 10, 'is-outlined' : steps != 10}" v-on:click="steps = 10">
          <span>10</span>
        </button>
      </p>
      <p class="control">
        <button class="button is-small is-primary" v-bind:class="{ 'is-active' : steps == 100, 'is-outlined' : steps != 100}" v-on:click="steps = 100">
          <span>100</span>
        </button>
      </p>
    </div>
  </div>

  <div class="feedrate dragSelector" :id="id" v-else-if="type == 'feedrate'">
    <div class="wrapper dragSelector">
      <h3 class="dragSelector">Feedrate</h3>
      <input id="feedrate_slider" class="slider is-fullwidth is-info is-small is-circle" step="1" min="50" max="150" value="100" type="range" v-bind:value="feedrate" v-on:mousemove="setFeedrate()" v-on:mouseup="printHead('feedrate', null, null, null, null, feedrate)">
      <output style="position: relative; top: 8px;" v-bind:for="'feedrate_slider'" class="dragSelector">{{ feedrate }}%</output>
    </div>
  </div>

  <div class="printercommands" :id="id" v-else-if="type == 'printercommands'">
    <div class="buttons" v-for="value in $gcodes[$localStorage.get('printer_firmware')]"><button class="button is-small is-fullwidth" v-on:click="pcmds(value.gcmd)"><i class="fas" v-bind:class="value.icon"></i>&nbsp;<span>{{ value.label }}</span></button></div>
  </div>

  <div class="jobcontrol dragSelector" :id="id" v-else-if="type == 'jobcontrol'">
    <h2 class="dragSelector">{{this.printerState.payload.state_string}}</h2>
    <span id="btn_pause" class="button is-fullwidth"  v-bind:disabled="stateButtons.btn_pause.disabled" v-if="stateButtons.btn_pause.visible" v-on:click="pauseJob()">pause</span>
    <span id="btn_resume" class="button is-fullwidth" v-bind:disabled="stateButtons.btn_resume.disabled" v-if="stateButtons.btn_resume.visible" v-on:click="resumeJob()">resume</span>
    <span id="btn_cancel" class="button is-fullwidth is-danger" v-bind:disabled="stateButtons.btn_cancel.disabled" v-if="stateButtons.btn_cancel.visible" v-on:click="cancelJob()">cancel</span>
    </div>
  </div>

  <div class="gcodebutton" :id="id" v-else-if="type == 'gcodebutton'">
    <div class="buttons"><button class="button is-small is-fullwidth" v-on:click="pcmds(source)">{{title}}</button></div>
  </div>

  <div class="toolcommands" :id="id" v-else-if="type == 'toolcommands'">
    <div class="wrapper dragSelector">
      <div class="field" style="text-align: left;">
        <div class="select is-small is-fullwidth">
          <select v-model="selectedtool" @change="toolCommand('select', selectedtool, null, null, null)">
            <option value="choose">choose tool</option>
            <option value="tool0">Hotend</option>
          </select>
        </div>
      </div>
      <div class="field dragSelector" style="text-align: left;">
        <div class="control dragSelector">
          <input class="input is-small" type="text" v-model="toolcommand_value" placeholder="5" style="width: 70%; float: left; text-align: right"><label class="input is-small is-light" style="width: 20%; float: left;">mm</label>
          <div style="clear: both;"></div>
        </div>
      </div>

      <div class="field dragSelector" style="text-align: left;">
        <div class="buttons dragSelector">
          <button class="button is-small is-primary is-fullwidth" v-on:click="toolCommand('extrude', null, null, toolcommand_value, null)"><span>Extrude</span></button>
        </div>
        <div class="buttons dragSelector">
          <button class="button is-small is-primary is-fullwidth" v-on:click="toolCommand('extrude', null, null, '-'+toolcommand_value, null)"><span>Retract</span></button>
        </div>
      </div>

      <hr />
      <input id="flowrate_slider" class="slider is-fullwidth is-info is-small is-circle" step="1" min="75" max="125" value="100" type="range" v-bind:value="flowrate" v-on:mousemove="setFlowrate()" v-on:mouseup="toolCommand('flowrate', null, null, null, flowrate)">
      <output style="position: relative; top: 8px;" v-bind:for="'flowrate_slider'">Flowrate: {{ flowrate }}%</output>
    </div>
  </div>

  <div class="terminalwidget dragSelector" :id="id" v-else-if="type == 'terminalwidget'">
    <div class="field">
      <div class="control">
        <textarea id="terminal_console" class="textarea dragSelector" placeholder="" v-model="terminalLogs"></textarea>
      </div>
    </div>
  </div>
  
  <div class="filebrowser dragSelector" :id="id" v-else-if="type == 'filebrowser'">
    <table id="filebrowser_head" class="table is-fullwidth dragSelector">
      <thead class="dragSelector">
        <tr colspan="3" class="dragSelector">
          <td class="dragSelector">
              <div class="tabs is-centered is-boxed dragselector">
              <ul class="dragSelector">
                <li id="tab_local" v-bind:class="{ 'is-active' : file_origin == 'local' }"><a v-on:click="changeFileSource('local')"> <i class="fas fa-hdd"></i>&nbsp;local</a></li>
                <li id="tab_sdcard" v-bind:class="{ 'is-active' : file_origin == 'sdcard' }"><a v-on:click="changeFileSource('sdcard')"><i class="fas fa-sd-card"></i>&nbsp;sdcard</a></li>
                <li id="tab_thingiverse" v-bind:class="{ 'is-active' : file_origin == 'thingiverse' }"><a v-on:click="changeFileSource('thingiverse');thingiverse_search()"><span class="thingiverse">T</span>&nbsp;thingiverse</a></li>
              </ul>
            </div>
          </td>
        </tr>
      </thead>
    </table>

    <div id="filewrapper" class="dragSelector">
      <div v-if="file_origin == 'local' || file_origin == 'sdcard'" class="dragSelector">

        <div v-if="selectedfolder != ''" v-on:click="folderup()" style="text-align: left"><span style="cursor: pointer;">&#x2190; back</span></div>
        <table class="table is-striped is-hoverable dragSelector" id="filestable">
          <tbody id="filesbody" class="dragSelector">
            <tr v-on:click="selectFolder(folder.path)" v-for="folder in folders"><td><span class="icon">&#128193;</span></td><td>{{ folder.display }}</td><td></td></tr>
            <tr :id="'filerow'+index"  v-on:click="selectFile($event, file, index)" v-for="(file, index) in files">
              
              <td>
                <figure v-if="$localStorage.get('previewimages') == 'yes'" class="image is-128x128"><img :src="file.img" :id="file.thumbid" class="thumb" @error="imgFallback" v-on:mousemove="zoomIn($event, file.thumbid, 'overlay_'+file.imgid)" v-on:mouseleave="zoomOut(''+file.imgid)"></figure>
                <div class="overlay_wrapper">
                  <div :id="'overlay_'+file.imgid" class="zoomoverlay" v-bind:style="{'background-image': 'url(' + file.img + ')' }"></div>
                </div>
              </td>
              <td>
                {{ file.display }} 
                <span v-if="file.prints != null">
                    <i class="fas" alt="last print" :class="{'fa-thumbs-up': file.prints.last.success}" v-if="file.prints.last.success" style="color: #31cf65;"></i>
                    <i class="fas" alt="last print" :class="{'fa-thumbs-down': !file.prints.last.success}" v-if="!file.prints.last.success" style="color: #fc3c63;"></i>
                </span><br />
                <div class="analysis" style="width: 100%;">
                  <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.gcodeAnalysis.dimensions.width != null">Size:</div><div style="width: 100%;" v-if="file.gcodeAnalysis.dimensions.width != null">x: {{ formatLenght(file.gcodeAnalysis.dimensions.width) }} y: {{ formatLenght(file.gcodeAnalysis.dimensions.depth) }} z: {{ formatLenght(file.gcodeAnalysis.dimensions.height) }}</div>
                  <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.gcodeAnalysis.estimatedPrintTime != null">PrintTime:</div><div v-if="file.gcodeAnalysis.estimatedPrintTime != null">{{ formatTime(file.gcodeAnalysis.estimatedPrintTime) }}</div>
                  <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.gcodeAnalysis.filament.tool0 != null && file.gcodeAnalysis.filament.tool0.length != null">Filament:</div><div v-if="file.gcodeAnalysis.filament.tool0 != null && file.gcodeAnalysis.filament.tool0.length != null">{{ formatLenght(file.gcodeAnalysis.filament.tool0.length) }}</div>
                  <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.prints != null">Prints ok/nok:</div><div v-if="file.prints != null">{{ file.prints.success }} / {{ file.prints.failure }}</div>
                </div>
              </td>
              <td>{{formatDate(file.date)}} 
                <div class="file_buttons" :id="'fb_'+file.imgid">
                  <!-- <span id="btn_load" class="button is-warning is-small" disabled v-on:click="loadprintFile(false)">load</span> !-->
                  <span id="btn_print" class="button is-success is-small" disabled v-on:click="loadprintFile(true, false)">print</span> 
                  <!-- <span id="btn_delete" class="button is-primary is-small" disabled v-on:click="toggleModalFileMove()">move</span> !-->
                  <span id="btn_delete" class="button is-danger is-small" disabled v-on:click="deleteFile()">delete</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="file_origin == 'thingiverse'">
        <div class="columns is-vcentered" style="margin-bottom: 30px; margin-top: 1px;">
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

  </div>
  
</template>

<script>
export default {
  props: ['type', 'reference', 'source', 'id', 'title'],
  data() {
    return {
      mounted: false,
      value: "",
      imgsrc: "",
      steps: 10,
      feedrate: 100,
      flowrate: 100,
      selectedtool: "choose",
      toolcommand_value: 5
    }
  },
  mounted: function() {
    this.mounted = true;
    if(this.type == 'label' || this.type == 'terminalwidget') {
      var el = document.getElementById(this.id);
      var resizeElement = el,
        resizeCallback = function() {
      };
      addResizeListener(resizeElement, this.resized);
    }
  },
  methods: {
    test: function(source) {
      alert(source);
    },
    setFeedrate: function(){
      var fr = $("#feedrate_slider").val();
      this.feedrate = fr;
    },
    setFlowrate: function(){
      var fr = $("#flowrate_slider").val();
      this.flowrate = fr;
    },
    resized: function(el) {
      var el = document.getElementById(this.id);
      if(this.type == "label") {
        var fontSize = $('#'+this.id).css('font-size').replace("px", "");
        var childFontSize = $('#'+this.id+' > .source').css('font-size').replace("px", "");
        if(parseInt(fontSize) < el.offsetWidth-50 && parseInt(fontSize) < el.offsetHeight-50) {
          $('#'+this.id).css({
            fontSize: (el.offsetWidth+el.offsetHeight)/9+"px"
          });
          $('#'+this.id+' > .source').css({
            fontSize: (el.offsetWidth+el.offsetHeight)/18+"px"
          });
        }
      }
      if(this.type == "terminalwidget") {
        $('#terminal_console').css({height: el.offsetHeight+"px"});
      }
    }
  },
  computed: {
    stateButtons: function() {
      var buttonstate = {"btn_pause": {"disabled": false, "visible": true}, "btn_cancel": {"disabled": false, "visible": true}, "btn_resume": {"disabled": false, "visible": true}}
      if(this.$store.state.printerState.payload.state_id == "PRINTING") {
        buttonstate.btn_pause.disabled = false;
        buttonstate.btn_pause.visible = true;
        buttonstate.btn_cancel.disabled = false;
        buttonstate.btn_cancel.visible = true;
        buttonstate.btn_resume.disabled = true;
        buttonstate.btn_resume.visible = false;
      }
      if(this.$store.state.printerState.payload.state_id == "RESUMING") {
        buttonstate.btn_pause.disabled = false;
        buttonstate.btn_pause.visible = true;
        buttonstate.btn_cancel.disabled = false;
        buttonstate.btn_cancel.visible = true;
        buttonstate.btn_resume.disabled = true;
        buttonstate.btn_resume.visible = false;
      }
      if(this.$store.state.printerState.payload.state_id == "PAUSING" || this.$store.state.printerState.payload.state_id == "PAUSED") {
        buttonstate.btn_pause.disabled = true;
        buttonstate.btn_pause.visible = false;
        buttonstate.btn_cancel.disabled = false;
        buttonstate.btn_cancel.visible = true;
        buttonstate.btn_resume.disabled = false;
        buttonstate.btn_resume.visible = true;
      }
      if(this.$store.state.printerState.payload.state_id == "CANCELLING" || this.$store.state.printerState.payload.state_id == "OPERATIONAL" || this.$store.state.printerState.payload.state_id == "" || this.$store.state.printerState.payload.state_id == "OFFLINE") {
        buttonstate.btn_pause.disabled = true;
        buttonstate.btn_pause.visible = false;
        buttonstate.btn_cancel.disabled = true;
        buttonstate.btn_cancel.visible = true;
        buttonstate.btn_resume.disabled = true;
        buttonstate.btn_resume.visible = true;
      }
      return buttonstate;
    },
    widgetData: function () {
      if(this.type == "pie-chart") {
        return this.pie_stats_printing;
      }
      if(this.type == "line-chart") {
        if(this.mounted) {
          this.$refs[this.reference].chart.update();
        }
        return this.line_temps;
      }
      if(this.type == "image-container") {
        return this.cam;
      }
      if(this.type == "jobstatus") {
      	var data = {};
      	data.printfile = this.job.printfile
        return this.job.printfile;
      }
      
      if(this.type == "gauge" || this.type == "tempcontrol") {
        //console.log(this.graphs);
        for(var i = 0; i< this.graphs.length; i++) {
          if(this.graphs[i].name == this.source.split(".")[0]) {
            if(this.mounted) {
              if(this.source.split(".")[1] == null) {
                if(this.temps[this.source.split(".")[0]] != null) {
                  if(this.temps[this.source.split(".")[0]].actual != null && this.temps[this.source.split(".")[0]].target != null) {
                    this.value = this.temps[this.source.split(".")[0]].actual+"/"+this.temps[this.source.split(".")[0]].target;
                  } else {
                    this.value = "0/0";
                  }
                } else {
                  this.value = "0/0";
                }
              } else {
                this.value = this.temps[this.source.split(".")[0]][this.source.split(".")[1]];
              }
              if(this.source.split(".")[0] == "bed") {
                this.imgsrc = "img/bed-icon2.png";
              } else if(this.source.split(".")[0] == "chamber") {
                this.imgsrc = "img/chamber-icon2.png";
              } else {
                  this.imgsrc = "img/hotend-icon2.png";
              }
              this.$refs[this.reference].chart.update();
            }
            return this.graphs[i]
          }
        }
      }
      if(this.type == "label") {
        if(this.mounted) {
          
          for(var i = 0; i< this.graphs.length; i++) {
            if(this.graphs[i].name == this.source.split(".")[0]) {
              if(this.source.split(".").length > 1) {
                if(this.temps[this.source.split(".")[0]][this.source.split(".")[1]] == null) {
                  return 0;
                } else {
                  return this.temps[this.source.split(".")[0]][this.source.split(".")[1]] || 0;
                }
              } else {
                if(this.temps[this.source.split(".")[0]].actual == null) {
                  return 0+"/"+0
                } else {
                  return this.temps[this.source.split(".")[0]].actual+"/"+this.temps[this.source.split(".")[0]].target;
                }
              }
            }
          }
        }
      }     
    },
    widgetOptions: function () {
      if(this.type == "pie-chart") {
        return this.pie_stats_printing_options;
      }
      if(this.type == "line-chart") {
        return this.line_temps_options;
      }
      if(this.type == "gauge") {
        for(var i = 0; i< this.graphs.length; i++) {
          if(this.graphs[i].name == this.source.split(".")[0]) {
            return this.graphs[i].options
          }
        }
      }
    }
  },
  watch: {
    terminalLogs: function () {
    	if($('#terminal_console')[0] != undefined) {
      		$('#terminal_console').scrollTop($('#terminal_console')[0].scrollHeight);
      	}
    }
  },
}
</script>

<style scoped>
.chart {
   width: 20%;
   height: 20%
}
.image-container {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  overflow: hidden;
}
.widgetlabel {
  height: 100%;
  width: 100%;
  text-align: center;
  vertical-align: middle;
  padding-top: 2vh;
}
.widgetlabel>.source {
  font-size: 14px;
}
.gauge {
  margin: 0 auto;
  max-width: 80%;
  max-height: 80%;
}
.gaugeChart {
  position: relative;
  margin: 0 auto;
}
.gaugeFooter {
  position: absolute;
  top: 60%;
  left: 0;
  width: 100%;
}
.gauge_value {
  width: 100%;
  text-align: center;
}
.gauge_label {
  width: 100%;
  text-align: center;
  font-size: 100%;
  font-weight: bold;
}
.gauge_label>img {
  width: 20%;
  margin-right: 4px;
}
.missing {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  font-size: 16px !important;
  background-color: rgb(255, 236, 236);
}
.printhead {
  margin: 0 auto;
  height: 100%;
  justify-content:center;
  display: flex;
  flex-direction: column;
}
.printhead>.center {
  display:flex;
  align-items:center;
  justify-content:center;
  margin: 0 auto;
}
.printhead>.vertical {
  width: auto;
  clear: both;
  justify-content:center;
  margin-top: 2vh;
}
.ctrlbuttons td {
  padding: 4px;
}
.ctrlbutton {
  max-width: 30px;
  max-height: 30px;
}
.feedrate, .toolcommands {
  margin: 0 auto;
  height: 100%;
  align-items:center;
  justify-content:center;
  display: flex;
  flex-direction: column;
}
.printercommands {
  padding: 10px;
  overflow: auto;
}
.wrapper {
  width: 80%;
}
.terminalwidget {
  height: 100%;
  width: 100%;
}
#terminal_console {
  width: 100vw !important;
  background-color: rgba(0,0,0,0.8);
  color: #fff;
  resize: none;
}
.tempcontrol {
  padding: 5% 5% 5% 20%;
}
.jobstatus {
	padding: 5% 5% 5% 5%;
}
.gcodebutton, .jobcontrol {
  padding: 10px;
  overflow: auto;
}
.jobcontrol > span {
  margin: 5px 0px 5px 0px;
}

.filebrowser {
  position: relative;
  padding: 10px;
  height: 100%;
  width: 100%;
}
#filewrapper {
  height: 88%;
  overflow: scroll;
}
#filestable {
  width: 100%;
}
tr.is-selected, td.is-selected {
  background-color: #c9ffed !important;
  color: black !important;
}
.thumb {
  background-repeat: no-repeat;
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
}
.overlay_wrapper {
  position: relative;
}
.zoomoverlay {
  border: 1px solid #d8d8d8;
  width: 340px;
  height: 272px;
  display: none;
  background-repeat: no-repeat;
  position: absolute;
  top: -128px;
  left: 242px;
  background-color: white;
  background-size: 800px 600px;
}
.file_buttons {
  z-index: 800;
  margin: 10px 0px 0px 0px;
}
.file_buttons span {
  display: none;
  margin: 5px 5px 0px 5px;
}
.file_buttons_thingiverse span {
  margin: 5px 5px 0px 5px;
}
.thingiverse {
  font-weight: bold;
  -moz-border-radius: 50%;
  border-radius: 50%;
  border: 1px solid #000;
  text-align: center;
  width: 20px;
  height: 20px;
}
#filestable tr {
  cursor: pointer;
}
.analysis > * {
  font-size: 80%;
}
</style>