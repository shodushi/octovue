<template>
    <section class="section" id="mainPage" v-if="page == 'main' || !page">

        <div class="">
            <div class="columns">

            <div class="column is-one-fifths" v-if="printerState.payload.state_string == 'Printing' || printerState.payload.state_string == 'Paused' || printerState.payload.state_string == 'Pausing' || printerState.payload.state_string == 'Resuming'">
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
            
            <div id="files" class="column" v-bind:class="{ 'is-four-fifths': printerState.payload.state_string != 'Printing' && printerState.payload.state_string != 'Paused' && printerState.payload.state_string != 'Pausing' && printerState.payload.state_string != 'Resuming', 'is-three-fifths' : printerState.payload.state_string == 'Printing' || printerState.payload.state_string == 'Paused' || printerState.payload.state_string == 'Pausing' || printerState.payload.state_string == 'Resuming' }" v-if="file_origin == 'local' || file_origin == 'sdcard' || file_origin == 'thingiverse'">

                <div class="modal" v-bind:class="{ 'is-active' : modalfilemove }">
                    <div class="modal-background"></div>
                    <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">move {{ selectedfile.path }}</p>
                        <button class="delete" aria-label="close" v-on:click="toggleModalFileMove"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="content" id="modalfilemove_content">
                            <div v-if="selectedmovefolder != ''" v-on:click="movefolderup()" style="text-align: left"><span style="cursor: pointer;">&#x2190; back</span></div>
                            <table class=" is-striped is-hoverable">
                                <tr v-on:click="selectMoveFolder(folder.path)" v-for="folder in $store.state.movefolders"><td width="20px"><span class="icon">&#128193;</span></td><td>{{folder.name}}</td></tr>
                            </table>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-right" v-on:click="moveFile()">move here</button>
                    </footer>
                    </div>
                </div>
                
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

<!---------------------------------------------------- !-->
                <div id="search">
                    <div class="field" style="text-align: left;">
                        <div class="control has-margin">
                            <input class="input" type="text" v-model="fileq" placeholder="search...">
                        </div>
                    </div>
                </div>

                <div v-if="fileSearchResult.length > 0">
                    <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
                        <tbody id="filesbody">
                        <tr :id="'filerow'+index" v-on:click="selectFile($event, file, index)" v-for="(file, index) in fileSearchResult">
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
                                <div class="analysis" style="width: 100%;" v-if="file.gcodeAnalysis != null">
                                    <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.gcodeAnalysis.dimensions.width != null">Size:</div><div style="width: 100%;" v-if="file.gcodeAnalysis.dimensions.width != null">x: {{ formatLenght(file.gcodeAnalysis.dimensions.width) }} y: {{ formatLenght(file.gcodeAnalysis.dimensions.depth) }} z: {{ formatLenght(file.gcodeAnalysis.dimensions.height) }}</div>
                                    <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.gcodeAnalysis.estimatedPrintTime != null">PrintTime:</div><div v-if="file.gcodeAnalysis.estimatedPrintTime != null">{{ formatTime(file.gcodeAnalysis.estimatedPrintTime) }}</div>
                                    <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.gcodeAnalysis.filament.tool0 != null && file.gcodeAnalysis.filament.tool0.length != null">Filament:</div><div v-if="file.gcodeAnalysis.filament.tool0 != null && file.gcodeAnalysis.filament.tool0.length != null">{{ formatLenght(file.gcodeAnalysis.filament.tool0.length) }}</div>
                                    <div style="width: 23%; float:left; margin-left: 10px;" v-if="file.prints != null">Prints ok/nok:</div><div v-if="file.prints != null">{{ file.prints.success }} / {{ file.prints.failure }}</div>
                                </div>
                            </td>
                            <td>{{formatDate(file.date)}} 
                                <div class="file_buttons" :id="'fb_'+file.imgid">
                                    <!-- <span id="btn_load" class="button is-warning is-small" disabled v-on:click="loadprintFile(false)">load</span> !-->
                                    <span id="btn_print" class="button is-success is-small" disabled v-on:click="loadprintFile(true, true)">print</span> 
                                    <!-- <span id="btn_delete" class="button is-primary is-small" disabled v-on:click="toggleModalFileMove()">move</span> !-->
                                    <span id="btn_delete" class="button is-danger is-small" disabled v-on:click="deleteFile()">delete</span>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

<!---------------------------------------------------- !-->


                <div v-if="selectedfolder != ''" v-on:click="folderup()" style="text-align: left"><span style="cursor: pointer;">&#x2190; back</span></div>
                <table class="table is-fullwidth is-striped is-hoverable" id="filestable" v-if="fileSearchResult.length < 1">
                    <tbody id="filesbody">
                    <tr v-on:click="selectFolder(folder.path)" v-for="folder in folders"><td><span class="icon">&#128193;</span></td><td>{{ folder.display }}</td><td></td></tr>
                    <tr :id="'filerow'+index" v-on:click="selectFile($event, file, index)" v-for="(file, index) in files">
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
                            <span id="btn_print" class="button is-success is-small" disabled v-on:click="loadprintFile(true, true)">print</span> 
                            <!-- <span id="btn_delete" class="button is-primary is-small" disabled v-on:click="toggleModalFileMove()">move</span> !-->
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

            <div class="column is-one-fifths">
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
                        <p>Tool-0 Temp: <span id="tool0tempactual" v-if="temps.tool0">{{ temps.tool0.actual }}</span>&deg; C / <span id="tool0temptarget" v-if="temps.tool0">{{ temps.tool0.target }}</span>&deg; C</p>
                        <p>Bed Temp: <span id="bedtempactual" v-if="temps.bed">{{ temps.bed.actual }}</span>&deg; C / <span id="bedtemptarget" v-if="temps.bed">{{ temps.bed.target }}</span>&deg; C</p>
                        </div>
                    
                        <div class="content" id="cardtools" style="border-top: 1px solid #C0C0C0; height: 270px;" v-if="printerState.payload.state_string != 'Offline'">

                            <div v-if="graphs.length <= 2">
                                <div v-for="graph in graphs" v-if="graph.name != 'bed' && graph.name != 'chamber'" style="text-align: left;">
                                    <div style="width: 25%; float: left; text-align: center;">
                                        {{graph.name}}<br />
                                        <input :id="'slider'+graph.name" class="slider is-fullwidth is-danger is-small is-circle has-output" step="1" min="0" max="290" v-on:mouseup="setExtruderTemp(graph.name)" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px; padding: 3px;" v-bind:for="'slider'+graph.name">{{ temps[graph.name].target }}</output>
                                    </div>
                                    <div style="width: 25%; float: left; text-align: center;">
                                        <p>&nbsp;</p>
                                        <div class="temp_ist"><div :id="'temp_'+graph.name+'_actual'"></div></div>
                                    </div>
                                </div>
                                <div v-for="graph in graphs" v-if="graph.name == 'bed'" style="text-align: left;">
                                    <div style="width: 25%; float: left; text-align: center;">
                                        {{graph.name}}<br />
                                        <input :id="'slider'+graph.name" class="slider is-fullwidth is-info is-circle has-output" step="1" min="0" max="115" v-on:mouseup="setBedTemp()" v-bind:value="temps[graph.name].target" type="range" orient="vertical"><output style="position: relative; top: 8px; padding: 3px;" v-bind:for="'slider'+graph.name">{{ temps[graph.name].target }}</output>
                                    </div>
                                    <div style="width: 25%; float: left; text-align: center;">
                                        <p>&nbsp;</p>
                                        <div class="temp_ist"><div :id="'temp_'+graph.name+'_actual'"></div></div>
                                    </div>
                                </div>
                                <div v-for="graph in graphs" v-if="graph.name == 'chamber'" style="text-align: left;">
                                    <div style="width: 25%; float: left; text-align: center;">
                                        {{graph.name}}<br />
                                        <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="60" v-on:mouseup="setChamberTemp()" v-bind:value="temps[graph.name].target" type="range" ><output style="position: relative; top: 8px; padding: 3px;" v-bind:for="'slider'+graph.name">{{ temps[graph.name].target }}</output>
                                    </div>
                                    <div style="width: 25%; float: left; text-align: center;">
                                        <p>&nbsp;</p>
                                        <div class="temp_ist"><div :id="'temp_'+graph.name+'_actual'"></div></div>
                                    </div>
                                </div>
<!--
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
                                    <input id="sliderBed" class="slider is-fullwidth is-info is-small is-circle has-output" step="1" min="0" max="100" v-bind:value="temps.bed.target" type="range" orient="vertical" v-on:mouseup="setBedTemp()"><output id="sliderbedoutput" for="sliderBed">{{temps.bed.target}}</output> &deg;C
                                </div>
                                <div style="width: 25%; float: left; text-align: center;">
                                    <p>&nbsp;</p>
                                    <div class="temp_ist"><div id="temp_bed_actual"></div></div>
                                </div>
!-->
                            </div>

                            <div v-if="graphs.length > 2" style="margin-top: 20px;">
                                <div v-for="graph in graphs" v-if="graph.name != 'bed' && graph.name != 'chamber'" style="text-align: left;">
                                    {{graph.name}}<br />
                                    <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="290" v-on:mouseup="setExtruderTemp(graph.name)" v-bind:value="temps[graph.name].target" type="range"><output style="position: relative; top: 8px;" v-bind:for="'slider'+graph.name">{{ temps[graph.name].target }}</output>
                                </div>
                                <div v-for="graph in graphs" v-if="graph.name == 'bed'" style="text-align: left;">
                                    {{graph.name}}<br />
                                    <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="100" v-on:mouseup="setBedTemp()" v-bind:value="temps[graph.name].target" type="range"><output style="position: relative; top: 8px;" v-bind:for="'slider'+graph.name">{{ temps[graph.name].target }}</output>
                                </div>
                                <div v-for="graph in graphs" v-if="graph.name == 'chamber'" style="text-align: left;">
                                    {{graph.name}}<br />
                                    <input :id="'slider'+graph.name" class="slider is-fullwidth is-circle has-output" step="1" min="0" max="50" v-on:mouseup="setChamberTemp()" v-bind:value="temps[graph.name].target" type="range"><output style="position: relative; top: 8px;" v-bind:for="'slider'+graph.name">{{ temps[graph.name].target }}</output>
                                </div>
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
                                    <a v-for="value in $gcodes[$localStorage.get('printer_firmware')]" class="dropdown-item" v-bind:data-id="value.cmd" v-on:click="pcmds(value.gcmd)"><i class="fas has-text-primary" v-bind:class="value.icon"></i>&nbsp;<span class="has-text-primary">{{ value.label }}</span></a>
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
</template>

<script>
export default {
    data() {
        return {
            fileq: ""
        }
    },
    watch: {
        fileq: function (after, before) {
            this.searchFiles(after);
        }
  },
}
</script>

<style scoped>
/*filebrowser*/
#filebrowser_head td {
  border: none;
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
#modalfilemove_content {
    color: #000;
}
.analysis > * {
  font-size: 80%;
}

</style>
