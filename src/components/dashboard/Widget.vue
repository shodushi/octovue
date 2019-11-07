<template>
  <chart class="piechart" v-if="type == 'pie-chart'" :ref="reference" :type="'pie'" :data="widgetData" :options="widgetOptions"></chart>

  <chart class="linechart" v-else-if="type == 'line-chart'" :ref="reference" :type="'line'" :data="widgetData" :options="widgetOptions"></chart>
  
  <div class="image-container" v-else-if="type == 'image-container'" :style="{ backgroundImage: 'url(\'' + widgetData + '\')' }"></div>

  <div class="gauge dragSelector" v-else-if="type == 'gauge'">
    <chart :ref="reference" :type="'pie'" v-bind:data="widgetData" :options="widgetOptions" class="dragSelector"></chart>
    <div class="gauge_value dragSelector">{{this.value}}</div>
    <div class="gauge_label dragSelector"><img :src="imgsrc">{{this.source}}</div><br />
  </div>

  <div class="widgetlabel" :id="id" v-else-if="type == 'label'">{{ widgetData }}<div class="source">{{this.source}}</div></div>
  
</template>

<script>
export default {
  props: ['type', 'reference', 'source', 'id'],
  data() {
    return {
      mounted: false,
      value: "",
      imgsrc: ""
    }
  },
  mounted: function() {
    this.mounted = true;

    if(this.type == 'label') {
      var el = document.getElementById(this.id);
      var resizeElement = el,
        resizeCallback = function() {
      };
      addResizeListener(resizeElement, this.resized);
    }
  },
  methods: {
    resized: function(el) {
      var el = document.getElementById(this.id);
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
                //this.value = this.formatDecimal(this.graphs[i].datasets[0].data[0]);
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
  padding: 0px;
}
.widgetlabel>.source {
  font-size: 14px;
}
.gauge {
  margin: 0 auto;
  max-width: 80%;
  max-height: 80%;
}
.gauge_value {
  width: 100%;
  text-align: center;
  position: relative;
  top: -9vh;
}
.gauge_label {
  width: 100%;
  text-align: center;
  font-size: 100%;
  font-weight: bold;
  position: relative;
  bottom: 7vh;
  left: 0;
}
.gauge_label>img {
  width: 20%;
  margin-right: 4px;
}

</style>