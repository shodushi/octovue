<template>
  <div id="dashboardPage" style="min-height: 800px;">
    <p class="control" id="btn_addWidget">
      <a class="bd-tw-button button is-small is-default" v-on:click="showAddWidget = true">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span>widget</span>
      </a>
    </p>

    <article class="message" id="addWidget" v-if="showAddWidget">
      <div class="message-header">
        <p>Add widget</p>
        <button class="delete" aria-label="delete" v-on:click="showAddWidget = false"></button>
      </div>
      <div class="message-body">

        <div class="field" style="text-align: left;">
          <label class="label">Title</label>
          <div class="control">
            <input class="input" type="text" placeholder="Temperatures" v-model="w_title">
          </div>
        </div>
        
        <div class="field" style="text-align: left;">
          <label class="label">Type</label>
          <div class="control">
            <div class="select">
              <select v-model="w_type">
                <option>choose</option>
                <option>gauge</option>
                <option>pie-chart</option>
                <option>line-chart</option>
                <option>image container</option>
                <option>label</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field" style="text-align: left;">
          <label class="label">Value</label>
          <div class="control">
            <div class="select">
              <select v-model="w_value">
                <option>choose</option>
                <option>tool0_actual</option>
                <option>tool0_target</option>
                <option>bed_actual</option>
                <option>bed_target</option>
                <option>cam url</option>
              </select>
            </div>
          </div>
        </div>

        <div class="control">
          <button class="button is-link" v-on:click="addWidget()">add widget</button>
        </div>
      </div>
    </article>


    <dnd-grid-container :layout.sync="layout" :cellSize="cellSize" :maxColumnCount="maxColumnCount" :maxRowCount="maxRowCount" :margin="margin" :bubbleUp="bubbleUp">
      <dnd-grid-box v-for="box in layout" :boxId="box.id" :key="box.id" dragSelector="div.dash-box-header" resizeVisible>
        <div class="card dash-box">
          <div class="dash-box-header">
            {{ box.title }}
          </div>
          <div class="dash-box-body" :id="'bbody'+box.id">
            {{ box.body }}
          </div>
        </div>
      </dnd-grid-box>
    </dnd-grid-container>
  </div>
</template>

<script>
import { Container, Box } from '@dattn/dnd-grid'
import '@dattn/dnd-grid/dist/dnd-grid.css'

import pieChart from './dashboard/pieChart.vue'
import Vue from 'vue'

export default {
  components: {
    DndGridContainer: Container,
    DndGridBox: Box,
    'pie-chart': pieChart
  },
  data() {
    return {
      cellSize: {
          w: 100,
          h: 100
      },
      maxColumnCount: Infinity,
      maxRowCount: Infinity,
      bubbleUp: true,
      margin: 15,
      layout: [],
      showAddWidget: "",
      w_title: "",
      w_type: "",
      w_value: "",
      widgetData: []
    }
  },
  methods: {
    addWidget: function() {
      var bodycontent;

      var widget = {
        id: this.layout[this.layout.length-1].id++,
        title: this.w_title,
        body: this.w_type,
        type: this.w_type,
        value: this.w_value,
        hidden: false,
        pinned: false,
        position: {
            x: 6,
            y: 0,
            w: 1,
            h: 2
        }
      };
      this.layout.push(widget);
      this.showAddWidget = false;
    },
    fillWidgets: function() {
      //<div style="width: 200px; height: 200px;"><pie-chart :ref="'aa'" :chartdata="pie_stats_printing" :options="pie_stats_printing_options"></pie-chart></div>
    }
  },
  created: function() {
  },
  mounted: function() {
    setTimeout(this.fillWidgets, 1);
    this.layout = JSON.parse(this.$localStorage.get('dashboardLayout'));
  },
  watch: {
    layout: function (before, after) {
      this.$localStorage.set('dashboardLayout', JSON.stringify(this.layout));
    }
  }
}
</script>

<style scoped>
#btn_addWidget {
  position: absolute;
  top: 9%; right: 1%;
}
</style>