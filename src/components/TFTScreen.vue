<template>
    <div class="container is-widescreen" style="background-color: #222122 !important;">

        <table id="main" class="" style="width: 100vw; height: 100vh;">
            <tr>
                <td class="top left"><button class="button is-tile solid-t"><a href="/#/"><div class="gradient"><img src="/img/octovue_logo.png"><span>Octovue</span></div></a></button></td>
                <td class="top center">
                    <button class="button is-tile solid-t btn-1" v-on:click="showPage('printer')"><div class="gradient"><img src="/img/z-bolt/control.svg"><span>Printer</span></div></button>
                    <button class="button is-tile solid-t btn-1" v-on:click="showPage('files')"><div class="gradient"><img src="/img/z-bolt/files.svg"><span>Files</span></div></button>
                    <button class="button is-tile solid-t btn-1" v-on:click="showPage('temperatures')"><div class="gradient"><img src="/img/z-bolt/heat-up.svg"><span>Temperatures</span></div></button>
                    <button class="button is-tile solid-t btn-1" v-on:click="showPage('movements')"><div class="gradient"><img src="/img/z-bolt/move.svg"><span>Movements</span></div></button>
                    <button class="button is-tile solid-t btn-1" v-on:click="showPage('job')"><div class="gradient"><img src="/img/z-bolt/print.svg"><span>Job</span></div></button>
                </td>
                <td class="top right"><button class="button is-tile solid-t btn-1" v-on:click="refresh()"><div class="gradient"><img src="/img/z-bolt/refresh.svg"><span>refresh</span></div></a></button></td>
            </tr>
            <tr>
                <td class="left">
                    <button v-if="$localStorage.get('powerhandling') == 'yes'" class="button is-tile solid-t btn-1" v-on:click="powerswitch()"><div class="gradient"><img src="/img/z-bolt/shutdown.svg"><span>Power</span></div><div id="powerstatus" :class="{'isok': isPower, 'isnok': isNotPower}"></div></button>
                    <button class="button is-tile solid-t btn-1" v-on:click="printerConnection()"><div class="gradient"><img src="/img/z-bolt/network.svg"><span>Connect</span></div><div id="connectionstatus" :class="{'isok': isConnection, 'isnok': isNotConnection, 'isconnecting': isConnecting}"></div></button>
                    <button v-if="$localStorage.get('lighthandling') == 'yes'" class="button is-tile solid-t btn-1" v-on:click="lightswitch()"><div class="gradient"><img src="/img/z-bolt/light.svg" style="fill: white"><span>Light</span></div><div id="lightstatus" :class="{'isok': isLight, 'isnok': isNotLight}"></div></button>
                </td>
                <td class="center" rowspan="2">
                    <div class="subpage" v-if="subPage == 'printer'">
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('G28 W')"><div class="gradient"><img src="/img/z-bolt/home.svg"><span class="tile_title">Home all axes</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('G80')"><div class="gradient"><img src="/img/z-bolt/bed-level.svg"><span class="tile_title">Mesh bed level</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M84')"><div class="gradient"><img src="/img/z-bolt/motor-off.svg"><span class="tile_title">Motors off</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M106')"><div class="gradient"><img src="/img/z-bolt/fan-on.svg"><span class="tile_title">Fan on</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M107')"><div class="gradient"><img src="/img/z-bolt/fan-off.svg"><span class="tile_title">Fan off</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M701')"><div class="gradient"><img src="/img/z-bolt/load_filament.svg"><span class="tile_title">Load filament</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M702')"><div class="gradient"><img src="/img/z-bolt/unload_filament.svg"><span class="tile_title">Unload filament</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M600')"><div class="gradient"><img src="/img/z-bolt/toolchanger.svg"><span class="tile_title">Change filament</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M0')"><div class="gradient"><img src="/img/z-bolt/stop.svg"><span class="tile_title">Emergency stop</span></div></button>
                    </div>

                    <div class="subpage" v-if="subPage == 'temperatures'">
                        <table width="640" id="tempwrapper">
                            <tr>
                                <td style="width: 20%; color: white;">
                                    <div style="width: 240px; float: left; text-align: center;" v-if="selectedTool != 'bed'">
                                        <input :id="'slider'+selectedTool" class="slider is-danger is-large is-circle" step="1" min="0" max="250" v-on:mouseup="setTemp()" v-bind:value="temps[selectedTool].target" type="range" orient="vertical">
                                        <div class="output">{{selectedTool}}<br />{{ temps[selectedTool].target }} / {{ temps[selectedTool].actual }}</div>
                                    </div>
                                    <div style="width: 240px; float: left; text-align: center;" v-if="selectedTool == 'bed'">
                                        <input :id="'slider'+selectedTool" class="slider is-info is-large is-circle" step="1" min="0" max="100" v-on:mouseup="setTemp()" v-bind:value="temps[selectedTool].target" type="range" orient="vertical">
                                        <div class="output">{{selectedTool}}<br />{{ temps[selectedTool].target }} / {{ temps[selectedTool].actual }}</div>
                                    </div>
                                </td>
                                <td style="width: 80%;">
                                    <button class="button is-tile solid-t" v-for="graph in graphs" v-on:click="changeTool(graph.name)"><div class="gradient"><img src="/img/z-bolt/extruder.svg"><span class="tile_title">{{graph.name}}</span></div></button>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="subpage" v-if="subPage == 'files'">
                        <div id="filewrapper">
                            <div id="filesource">
                                <a class="filesbutton" v-bind:class="{ 'is-active' : file_origin == 'local' }"><a v-on:click="changeFileSource('local')"> <i class="fas fa-hdd"></i>&nbsp;local</a></a>
                                <a class="filesbutton" v-bind:class="{ 'is-active' : file_origin == 'sdcard' }"><a v-on:click="changeFileSource('sdcard')"><i class="fas fa-sd-card"></i>&nbsp;sdcard</a></a>
                            </div>
                            <div id="">
                                <div v-if="file_origin == 'local' || file_origin == 'sdcard'">

                                    <div v-if="selectedfolder != ''" v-on:click="folderup()" style="text-align: left"><span id="backbutton">&#x2190; back</span></div>
                                    <table class="" id="filestable">
                                    <tbody id="filesbody" >
                                        <tr v-on:click="selectFolder(folder.path)" v-for="folder in folders"><td><span class="icon">&#128193;</span></td><td><span class="filename">{{ folder.display }}</span></td><td></td></tr>
                                        <tr v-on:click="selectFile($event, file)" v-for="file in files">
                                        
                                        <td v-if="file_origin == 'local'">
                                            <figure v-if="$localStorage.get('previewimages') == 'yes'" class="image is-128x128"><img :src="file.img" :id="file.thumbid" class="thumb" @error="imgFallback" v-on:mousemove="zoomIn($event, file.thumbid, 'overlay_'+file.imgid)" v-on:mouseleave="zoomOut(''+file.imgid)"></figure>
                                            <div class="overlay_wrapper">
                                            <div :id="'overlay_'+file.imgid" class="zoomoverlay" v-bind:style="{'background-image': 'url(' + file.img + ')' }"></div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="filename">{{ file.display }}</span>&nbsp;
                                            <span v-if="file.prints != null">
                                                <i class="fas" alt="last print" :class="{'fa-thumbs-up': file.prints.last.success}" v-if="file.prints.last.success" style="color: #31cf65;"></i>
                                                <i class="fas" alt="last print" :class="{'fa-thumbs-down': !file.prints.last.success}" v-if="!file.prints.last.success" style="color: #fc3c63;"></i>
                                            </span><br />
                                        </td>
                                        <td><span class="filedate">{{formatDate(file.date)}}</span></td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="subpage" v-if="subPage == 'movements'">
                        <div class="printhead ctrlbuttons">
                            <div class=""></div>
                            <div class="phcenter">
                            <div class="phhorizontal">
                                <table>
                                <tr>
                                    <td colspan="3" style="text-align: center">X / Y</td>
                                </tr>
                                <tr>
                                    <td ></td>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('jog', 0, steps, 0)"><i class="fas fa-arrow-up"></i></span></td>
                                    <td ></td>
                                </tr>
                                <tr>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('jog', '-'+steps, 0, 0)"><i class="fas fa-arrow-left"></i></span></td>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('home', null, null, null, ['x', 'y'])"><i class="fas fa-home"></i></span></td>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('jog', steps, 0, 0)"><i class="fas fa-arrow-right"></i></span></td>
                                </tr>
                                <tr>
                                    <td ></td>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('jog', 0, '-'+steps, 0)"><i class="fas fa-arrow-down"></i></span></td>
                                    <td ></td>
                                </tr>
                                </table>
                            </div>
                            <div class="phhorizontal dragSelector">
                                <table>
                                <tr>
                                    <td colspan="3" style="text-align: center">Z</td>
                                </tr>
                                <tr>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('jog', 0, 0, steps)"><i class="fas fa-arrow-up"></i></span></td>
                                </tr>
                                <tr>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('home', null, null, null, ['z'])"><i class="fas fa-home"></i></span></td>
                                </tr>
                                <tr>
                                    <td ><span class="button ctrlbutton solid-t2" v-on:click="printHead('jog', 0, 0, '-'+steps)"><i class="fas fa-arrow-down"></i></span></td>
                                </tr>
                                </table>
                            </div>
                            </div>
                            <div class="field has-addons vertical dragSelector">
                            <p class="control">
                                <button class="button is-medium solid-tc" v-bind:class="{ 'is-active' : steps == 0.1, 'is-outlined' : steps != 0.1}" v-on:click="steps = 0.1">
                                <span>0.1</span>
                                </button>
                            </p>
                            <p class="control">
                                <button class="button is-medium solid-tc" v-bind:class="{ 'is-active' : steps == 1, 'is-outlined' : steps != 1}" v-on:click="steps = 1">
                                <span>1</span>
                                </button>
                            </p>
                            <p class="control">
                                <button class="button is-medium solid-tc" v-bind:class="{ 'is-active' : steps == 10, 'is-outlined' : steps != 10}" v-on:click="steps = 10">
                                <span>10</span>
                                </button>
                            </p>
                            <p class="control">
                                <button class="button is-medium solid-tc" v-bind:class="{ 'is-active' : steps == 100, 'is-outlined' : steps != 100}" v-on:click="steps = 100">
                                <span>100</span>
                                </button>
                            </p>
                            </div>
                        </div>
                    </div>

                    <div class="subpage" v-if="subPage == 'job'">
                        <button class="button is-tile solid-t btn-1" v-on:click="cancelJob()"><div class="gradient"><img src="/img/z-bolt/stop.svg"><span class="tile_title">stop print</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pauseJob()"><div class="gradient"><img src="/img/z-bolt/pause.svg"><span class="tile_title">pause print</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="resumeJob()"><div class="gradient"><img src="/img/z-bolt/resume.svg"><span class="tile_title">resume print</span></div></button>
                    </div>



                </td>
                <td class="right">
                    <div v-if="subPage == 'files'">
                        <button class="button is-tile solid-background  btn-1" v-on:click="showPage()" v-bind:class="{ 'solid-green-2' : this.$store.state.selectedfile != '' }"><div class="gradient"><img src="/img/z-bolt/back.svg"><span class="tile_title">print</span></div></button>
                    </div>
                    <div v-if="subPage == 'temperatures'">
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M104 S0')"><div class="gradient"><img src="/img/z-bolt/extruder.svg"><span class="tile_title">Extruder off</span></div></button>
                        <button class="button is-tile solid-t btn-1" v-on:click="pcmds('M140 S0')"><div class="gradient"><img src="/img/z-bolt/bed.svg"><span class="tile_title">Bed off</span></div></button>
                    </div>
                    
                </td>
            </tr>
            <tr>
                <td class="bottom left"></td>
                <td class="bottom right">
                    <button class="button is-tile solid-t btn-1" v-on:click="showPage()"><div class="gradient"><img src="/img/z-bolt/back.svg"><span class="tile_title">back</span></div></button>
                </td>
            </tr>
        </table>














    </div>
</template>

<script>

export default {
    data: function() {
        return  {
            subPage: "printer",
            selectedTool: "tool0",
            maxValue: 250,
            steps: 10,
        }
    },
    mounted: function() {
    },
    methods: {
        showPage: function(page) {
            console.log("showpage", page);
            if(page == null) {
                this.subPage = "printer";
            } else {
                this.subPage = page;
            }
        },
        refresh: function() {
            this.$router.go();
        },
        changeTool: function(tool) {
            if(this.tool == 'bed') {
                this.maxValue = 100;
            } else {
                this.maxValue = 250;
            }
            this.selectedTool = tool;
        },
        setTemp: function() {
            if(this.selectedTool == 'bed') {
                this.setBedTemp();
            } else {
                this.setExtruderTemp(this.selectedTool);
            }
        },
    },
    computed: {

    },
    watch: {

    },
}

</script>

<style scoped>
.section {
    margin: 0px !important;
}
.is-tile {
    text-align: center;
    cursor: pointer;
    width: 120px;
    height: 120px;
    display: inline-block;
    text-decoration: none;
    margin-right: 5px;
    margin-bottom: 5px;
    margin: 4px;
    padding: 0;
    border: 0px;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    transition: all 0.3s;
}
.is-tile:after {
    content: '';
    position: absolute;
    z-index: -1;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    transition: all 0.3s;
}
.btn-1:hover {
    background: #2980b9;
}

.btn-1:active {
    background: #2980b9;
    top: 2px;
}

.btn-1:before {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    line-height: 3;
    font-size: 140%;
    width: 60px;
}

.subpage {
    text-align: center;
    margin: 0 auto;
}

.gradient {
	background: -moz-linear-gradient(-45deg,  rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%); /* FF3.6+ */
	background: -webkit-gradient(linear, left top, right bottom, color-stop(0%,rgba(255,255,255,0)), color-stop(100%,rgba(255,255,255,0.3))); /* Chrome,Safari4+ */
	background: -webkit-linear-gradient(-45deg,  rgba(255,255,255,0) 00%,rgba(255,255,255,0.3) 100%); /* Chrome10+,Safari5.1+ */
	background: -o-linear-gradient(-45deg,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.3) 100%); /* Opera 11.10+ */
	background: -ms-linear-gradient(-45deg,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.3) 100%); /* IE10+ */
	background: linear-gradient(-45deg,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.3) 100%); /* W3C */        display: block;
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    text-align: center;
}
.gradient > img {
    margin: 0 auto 0 auto;
    margin-bottom: 10px;
    padding-top: 10px;
    height: 54px;
    width: 54px;
    position: relative;
    top: 15%;
    display: block;
}
.gradient > span {
    color: white;
    text-shadow: 1px 1px #000000;
    padding-bottom: 10px;
    display: block;
    margin: 20% 0 0 0;
    padding: 0;
    border: 0px;
    text-align: center;
    font-size: 1.4vw;
    font-weight: bold;
}
.button.solid-tc {
    background-color: transparent;
    color: white;
    border-color: white;
}
.button.solid-tc:active, .button.solid-tc.is-active {
    background-color: #118fe4;
    border-color: transparent;
    color: #fff;
}
.solid-t {
    background: #0744b4;
}
.solid-t2 {
    background: #118fe4;
}

.solid-background {
    background: #222122;
}
.solid-olive {
    background: #999900;
}
.solid-pink {
    background: #FF539B;
}
.solid-orange-2 {
    background: #FF6600;
}
.solid-red-2 {
    background: #E81750;
}
.solid-grass {
    background: #CDCD00;
}
.solid-purple {
    background: #D02090;
}
.solid-blue {
    background: #00BBE2;
}
.solid-blue-2 {
    background: #2C84EE;
}
.solid-orange {
    background: #FB8F02;
}
.solid-coral {
    background: #CD5B45;
}
.solid-green-2 {
    background: #96BF01;
}
.solid-yellow {
    background: #F7D100;
}
.solid-darkgreen {
    background: #016C38;
}
.solid-red {
    background: #E51400;
}
.solid-darkred {
    background: #5F0000;
}
.solid-red-2 {
    background: #E81750;
}
.solid-black {
    background: #000;
}
#filestable {
    width: 100%;
    color: white;
}
#filestable tr {
    line-height: 250%;
}
#filewrapper {
    height: 70vh;
    width: 100%;
    overflow:scroll;
    overflow-x: hidden;
    float: left;
}
::-webkit-scrollbar {
    width: 30px;
}
 
::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(238, 227, 227, 0.3); 
    border-radius: 10px;
}
 
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(235, 226, 226, 0.5); 
}
.filesbutton {
    margin: 5px 5px 5px 5px;
}
#filesource {
    text-align: right;
    margin-bottom: 9px;
    margin-top: 15px;
}
#filesource > a {
    border: 1px solid white;
    padding: 10px;
}
#filesource > a > * {
    color: white;
}
table#tempwrapper, table#tempwrapper td {
    padding: 3px;
    margin-left: 40px;
}
.tempsliderwrapper {
    color: white;
}
.tempslider {
    width: 225px;
    padding: 10px;
}

input[type=range] {
    height: 200px;
}
input[type=range].slider+output {
    background-color: rgb(34, 33, 34) !important;
    margin-right: 5px;
}
.output {
    font-size: 1.2em;
    font-weight: bold;
}
#tempbuttons {
    width: 120px;
    height: 200px;
}
#main td {
    padding: 10px;
}
.left {
    width: 10vw;
}
.center {
    width: 80vw;
    text-align: center;
}
.right {
    width: 10vw;
}
.top {
    height: 10vh;
}
.bottom {
    height: 10vh;
}
.two {
    height: 90vh;
}
.filename {
    font-size: 1.4em;
}
.filedate {
    font-size: 1.4em;
}
#backbutton {
    cursor: pointer;
    color: white;
    font-size: 1.3em;
}

.printhead {
  margin: 0 auto;
  width: 240px;
  height: 240px;
  color: white;
  font-weight: bold;
  justify-content:center;
  display: flex;
  flex-direction: column;
  margin-top: 2vh;
}
.printhead>.phcenter {
  display:flex;
  align-items:center;
  justify-content:center;
  margin: 0 auto;
}
.printhead>.vertical {
  width: auto;
  clear: both;
  justify-content:center;
  margin-top: 3vh;
}
.ctrlbuttons td {
  padding: 4px;
}
.ctrlbutton {
  max-width: 50px;
  max-height: 50px;
  color: white;
  border: none;
}
#powerstatus, #connectionstatus, #lightstatus {
    width: 15px;
    height: 15px;
    position: absolute;
    bottom: 7px;
    right: 5px;
}
.isok {
    background-color: green;
}
.isnok {
    background-color: red;
}
.isconnecting {
   background-color: yellow; 
}
</style>