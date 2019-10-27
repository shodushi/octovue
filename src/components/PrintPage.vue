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
</template>

<script>
export default {
  
  watch: {
    linechart_changed: {
      handler: function (after, before) {
        // Return the object that changed
        this.$refs.tempchart.chart.update();
      }
    },
    pie_tool0_changed: {
      handler: function (after, before) {
        // Return the object that changed
        this.$refs.tool0chart.chart.update();
        this.$refs.bedchart.chart.update(); 
      }
    },
    pie_bed_changed: {
      handler: function (after, before) {
        // Return the object that changed
        this.$refs.tool0chart.chart.update();
        this.$refs.bedchart.chart.update();
      }
    }
  },
  computed: {
    linechart_changed() {
      return this.$store.state.line_temps;
    },
    pie_tool0_changed() {
      return this.$store.state.pie_tool0;
    },
    pie_bed_changed() {
      return this.$store.state.pie_bed;
    }
  }

}
</script>