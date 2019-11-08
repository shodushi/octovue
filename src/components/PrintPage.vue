<template>
    <section class="section" id="printPage">
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
              <span id="btn_resume" class="button is-fullwidth" v-bind:disabled="printerState.payload.state_string != 'Paused'" v-if="printerState.payload.state_string == 'Paused'" v-on:click="resumeJob()">resume</span>
            </div>
            <div style="width: 50%;">
              <span id="btn_cancel" class="button is-fullwidth is-danger" v-bind:disabled="this.printerState.payload.state_string != 'Printing' && this.printerState.payload.state_string != 'Paused'" v-on:click="cancelJob()">cancel</span>
            </div>
          </div>
          </div>

        </div>

        <div class="columns" id="printPage_temp">
          <div class="column is-half" style="padding: 0 50px 0 0">
            <chart ref="tempchart" :type="'line'" v-bind:data="line_temps" :options="line_temps_options"></chart>
          </div>
          
          <div class="column is-half">
            <div class="" style="max-width: 140px; max-height: 150px; margin: 0px 20px 0px 20px; float: left;" v-for="graph in graphs" v-if="graph.name != 'bed' && graph.name != 'chamber'">
              <chart :ref="graph.name+'chart'" :type="'pie'" v-bind:data="graph" :options="graph.options"></chart>
              <div style="font-size: 1em; font-weight: bold; position: relative; top: -75px;"><img src="img/hotend-icon2.png" style="width: 30px;">{{graph.name}}<br />{{ temps[graph.name].actual }}&deg;C</div>
            </div>
            <div class="" style="max-width: 140px; max-height: 150px; margin: 0px 20px 0px 20px; float: left;" v-for="graph in graphs" v-if="graph.name == 'bed'">
              <chart :ref="graph.name+'chart'" :type="'pie'" v-bind:data="graph" :options="graph.options"></chart>
              <div style="font-size: 1em; font-weight: bold; position: relative; top: -75px;"><img src="img/bed-icon2.png" style="width: 30px;">{{graph.name}}<br />{{ temps[graph.name].actual }}&deg;C</div>
            </div>
            <div class="" style="max-width: 140px; max-height: 150px; margin: 0px 20px 0px 20px; float: left;" v-for="graph in graphs" v-if="graph.name == 'chamber'">
              <chart :ref="graph.name+'chart'" :type="'pie'" v-bind:data="graph" :options="graph.options"></chart>
              <div style="font-size: 1em; font-weight: bold; position: relative; top: -75px;"><img src="img/chamber-icon2.png" style="width: 30px;">{{graph.name}}<br />{{ temps[graph.name].actual }}&deg;C</div>
            </div>
          </div>
          
        </div>

      </section>
</template>

<script>
import Chart from 'vue-bulma-chartjs';
export default {
  methods: {
    updateCharts: function() {
      for(var i = 0;i< this.$store.state.graphs.length;i++) {
        if(this.$refs[this.$store.state.graphs[i].name+"chart"] != null) {
          if(this.$refs[this.$store.state.graphs[i].name+"chart"][0] != null) {
            if(this.$refs[this.$store.state.graphs[i].name+"chart"][0].chart != null) {
              this.$refs[this.$store.state.graphs[i].name+"chart"][0].chart.update();
            }
          }
        }
      }
      this.$refs.tempchart.chart.update();
    }
  },
  watch: {
    temps: function () {
      this.updateCharts();
    }
  }
}
</script>

<style scoped>

/*printpage*/
.pp_boxes {
  font-size: 1.8em;
  color: #22d0b2;
  font-weight: bold;
}
#printPage_temp {
  margin-top: 50px;
}
#piecharts .columns .column {
  padding: 20px 20px 20px 20px;
}
</style>