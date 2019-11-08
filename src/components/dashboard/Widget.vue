<template>
  <div v-if="type == 'pie-chart'">
    <chart class="piechart"  :ref="reference" :type="'pie'" :data="widgetData" :options="widgetOptions"></chart>
    <div class="missing" v-if="widgetData == null">{{source}} not found</div>
  </div>
  
  <chart v-else-if="type == 'line-chart'" class="linechart" :ref="reference" :type="'line'" :data="widgetData" :options="widgetOptions"></chart>
    
  <div class="image-container" v-else-if="type == 'image-container'" :style="{ backgroundImage: 'url(\'' + widgetData + '\')' }"></div>

  <div class="gauge dragSelector" v-else-if="type == 'gauge'" :id="id">
    <chart :ref="reference" :type="'pie'" v-bind:data="widgetData" :options="widgetOptions" class="dragSelector gaugeChart"></chart>
    <div class="gaugeFooter">
      <div class="gauge_value dragSelector">{{this.value}}</div>
      <div class="gauge_label dragSelector"><img :src="imgsrc">{{this.source}}</div>
    </div>
    <div class="missing" v-if="widgetData == null">{{source}} not found</div>
  </div>

  <div class="widgetlabel" :id="id" v-else-if="type == 'label'">
    {{ widgetData }}<div class="source">{{this.source}}</div>
    <div class="missing" v-if="widgetData == null">{{source}} not found</div>
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
    <div class="field has-addons vertical">
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

  <div class="feedrate" :id="id" v-else-if="type == 'feedrate'">
    <div class="wrapper">
      <h3>Feedrate</h3>
      <input id="feedrate_slider" class="slider is-fullwidth is-info is-small is-circle" step="1" min="50" max="150" value="100" type="range" v-bind:value="feedrate" v-on:mousemove="setFeedrate()" v-on:mouseup="printHead('feedrate', null, null, null, null, feedrate)">
      <output style="position: relative; top: 8px;" v-bind:for="'feedrate_slider'">{{ feedrate }}%</output>
    </div>
  </div>

  <div class="printercommands" :id="id" v-else-if="type == 'printercommands'">
    <div class="buttons" v-for="value in $gcodes[$localStorage.get('printer_firmware')]"><button class="button is-small is-fullwidth" v-on:click="pcmds(value.gcmd)"><i class="fas" v-bind:class="value.icon"></i>&nbsp;<span>{{ value.label }}</span></button></div>
  </div>

  <div class="toolcommands" :id="id" v-else-if="type == 'toolcommands'">
    <div class="wrapper">
      <div class="field" style="text-align: left;">
        <div class="select is-small is-fullwidth">
          <select v-model="selectedtool" @change="toolCommand('select', selectedtool, null, null, null)">
            <option value="choose">choose tool</option>
            <option value="tool0">Hotend</option>
          </select>
        </div>
      </div>
      <div class="field" style="text-align: left;">
        <div class="control">
          <input class="input is-small" type="text" v-model="toolcommand_value" placeholder="5" style="width: 70%; float: left; text-align: right"><label class="input is-small is-light" style="width: 20%; float: left;">mm</label>
          <div style="clear: both;"></div>
        </div>
      </div>

      <div class="field" style="text-align: left;">
        <div class="buttons">
          <button class="button is-small is-primary is-fullwidth" v-on:click="toolCommand('extrude', null, null, toolcommand_value, null)"><span>Extrude</span></button>
        </div>
        <div class="buttons">
          <button class="button is-small is-primary is-fullwidth" v-on:click="toolCommand('extrude', null, null, '-'+toolcommand_value, null)"><span>Retract</span></button>
        </div>
      </div>

      <hr />
      <input id="flowrate_slider" class="slider is-fullwidth is-info is-small is-circle" step="1" min="50" max="125" value="100" type="range" v-bind:value="flowrate" v-on:mousemove="setFlowrate()" v-on:mouseup="toolCommand('flowrate', null, null, null, flowrate)">
      <output style="position: relative; top: 8px;" v-bind:for="'flowrate_slider'">Flowrate: {{ flowrate }}%</output>
    </div>
  </div>
  
</template>

<script>
export default {
  props: ['type', 'reference', 'source', 'id'],
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
    if(this.type == 'label' || this.type == 'gauge') {
      var el = document.getElementById(this.id);
      var resizeElement = el,
        resizeCallback = function() {
      };
      addResizeListener(resizeElement, this.resized);
    }
  },
  methods: {
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
    }
  },
  computed: {
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
      
      if(this.type == "gauge") {
        
        for(var i = 0; i< this.graphs.length; i++) {
          if(this.graphs[i].name == this.source.split(".")[0]) {
            if(this.mounted) {
              if(this.source.split(".")[1] == null) {
                this.value = this.temps[this.source.split(".")[0]].actual+"/"+this.temps[this.source.split(".")[0]].target;
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
  }
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
</style>