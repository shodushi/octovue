<template>
    <div class="container is-widescreen" style="background-color: #222122 !important;">

        <nav class="level" style="height: 20vh; padding-left: 1vw; padding-right: 1vw;">
            <!-- Left side -->
            <div class="level-left">
                <div class="level-item">
                    <button class="button is-tile solid-pink"><a href="/#/"><div class="gradient"><img src="/img/z-bolt/home.svg"><span>Octovue</span></div></a></button>
                </div>
                <div class="level-item">
                    <div class="field has-addons">
                        <button class="button is-tile solid-red-2" v-on:click="powerswitch()"><div class="gradient"><img src="/img/z-bolt/power.svg"><span>Power</span></div></button>
                        <button class="button is-tile solid-orange-2" v-on:click="showPage('files')"><div class="gradient"><img src="/img/z-bolt/files.svg"><span>Files</span></div></button>
                        <button class="button is-tile solid-orange-2" v-on:click="showPage('printer')"><div class="gradient"><img src="/img/z-bolt/control.svg"><span>Printer</span></div></button>

                    </div>
                </div>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <button class="button is-tile solid-pink" v-on:click="refresh()"><div class="gradient"><img src="/img/z-bolt/refresh.svg"><span>refresh</span></div></a></button>
            </div>
        </nav>
        

        <div id="content" style="height: 56vh; padding-left: 1vw; padding-right: 1vw; background-color: #222122 !important">
    
            <div class="subpage" v-if="subPage == 'printer'">
                <h2>Printer</h2>
                <button class="button is-tile solid-green-2" v-on:click="pcmds('G28 W')"><div class="gradient"><img src="/img/z-bolt/home.svg"><span class="tile_title">Home all axes</span></div></button>
                <button class="button is-tile solid-green-2" v-on:click="pcmds('G80')"><div class="gradient"><img src="/img/z-bolt/bed-level.svg"><span class="tile_title">Mesh bed level</span></div></button>

                <button class="button is-tile solid-green-2" v-on:click="pcmds('M84')"><div class="gradient"><img src="/img/z-bolt/motor-off.svg"><span class="tile_title">Motors off</span></div></button>

                <button class="button is-tile solid-green-2" v-on:click="pcmds('M106')"><div class="gradient"><img src="/img/z-bolt/fan-on.svg"><span class="tile_title">Fan on</span></div></button>
                <button class="button is-tile solid-green-2" v-on:click="pcmds('M107')"><div class="gradient"><img src="/img/z-bolt/fan-off.svg"><span class="tile_title">Fan off</span></div></button>

                <button class="button is-tile solid-green-2" v-on:click="pcmds('M701')"><div class="gradient"><img src="/img/z-bolt/load_filament.png"><span class="tile_title">Load filament</span></div></button>
                <button class="button is-tile solid-green-2" v-on:click="pcmds('M702')"><div class="gradient"><img src="/img/z-bolt/unload_filament.svg"><span class="tile_title">Unload filament</span></div></button>
                <button class="button is-tile solid-green-2" v-on:click="pcmds('M600')"><div class="gradient"><img src="/img/z-bolt/toolchanger.svg"><span class="tile_title">Change filament</span></div></button>


                <button class="button is-tile solid-green-2" v-on:click="pcmds('M0')"><div class="gradient"><img src="/img/z-bolt/stop.svg"><span class="tile_title">Emergency stop</span></div></button>    
            </div>


            <div class="subpage" v-if="subPage == 'files'">
                <table id="filebrowser_head" class="table is-fullwidth dragSelector">
                <thead >
                    <tr colspan="3" >
                    <td >
                        <div class="tabs is-centered is-boxed dragselector">
                        <ul >
                            <li id="tab_local" v-bind:class="{ 'is-active' : file_origin == 'local' }"><a v-on:click="changeFileSource('local')"> <i class="fas fa-hdd"></i>&nbsp;local</a></li>
                            <li id="tab_sdcard" v-bind:class="{ 'is-active' : file_origin == 'sdcard' }"><a v-on:click="changeFileSource('sdcard')"><i class="fas fa-sd-card"></i>&nbsp;sdcard</a></li>
                        </ul>
                        </div>
                    </td>
                    </tr>
                </thead>
                </table>

                <div id="filewrapper">
                    <div v-if="file_origin == 'local' || file_origin == 'sdcard'">

                        <div v-if="selectedfolder != ''" v-on:click="folderup()" style="text-align: left"><span style="cursor: pointer;">&#x2190; back</span></div>
                        <table class="table is-striped is-hoverable dragSelector" id="filestable">
                        <tbody id="filesbody" >
                            <tr v-on:click="selectFolder(folder.path)" v-for="folder in folders"><td><span class="icon">&#128193;</span></td><td>{{ folder.display }}</td><td></td></tr>
                            <tr v-on:click="selectFile($event, file)" v-for="file in files">
                            
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
                </div>
            </div>

        </div>

       <nav class="level" style="height: 20vh; padding-left: 1vw; padding-right: 1vw;">
            <!-- Left side -->
            <div class="level-left">
                <div class="level-item">
                    
                </div>
                <div class="level-item">
                    <div class="field has-addons">
                        
                    </div>
                </div>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <button class="button is-tile solid-green-2" v-on:click="showPage()"><div class="gradient"><img src="/img/z-bolt/back.svg"><span class="tile_title">back</span></div></button>
            </div>
        </nav>
    </div>
</template>

<script>

export default {
    data: function() {
        return  {
            subPage: "printer"
        }
    },
    mounted: function() {
        //$("#theme").attr("href", "css/themes/dark.css");
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
        }
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
    width: 100px;
    height: 100px;
    display: inline-block;
    text-decoration: none;
    margin-right: 5px;
    margin-bottom: 5px;
    margin: 4px;
    padding: 0;
    border: 0px;
}
.subpage {
    margin: 0 auto;
    width: 80vw;
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
    display: block;
}
.gradient > span {
    color: white;
    padding-bottom: 10px;
    display: block;
    margin: 0;
    padding: 0;
    border: 0px;
    text-align: center;
    font-size: 1.3vw;
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
</style>