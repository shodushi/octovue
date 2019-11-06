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
    <p class="control" id="btn_clearWidgets">
      <a class="bd-tw-button button is-small is-default" v-on:click="clearWidgets">
        <span class="icon">
          <i class="fas fa-trash"></i>
        </span>
        <span>{{debug}} clear widgets</span>
      </a>
    </p>

    <article class="message" id="addWidget" v-if="showAddWidget">
      <div class="message-header">
        <p>Add widget</p>
        <button class="delete" aria-label="delete" v-on:click="showAddWidget = false"></button>
      </div>
      <div class="message-body">
        
        <div class="field" style="text-align: left;">
          <label class="label">Type</label>
          <div class="control">
            <div class="select">
              <select v-model="w_type">
                <option value="">Choose an option</option>
                <option value="gauge">Gauge</option>
                <option value="pie-chart">Pie chart</option>
                <option value="line-chart">Line chart</option>
                <option value="image-container">Image container</option>
                <option value="label">Label</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field" style="text-align: left;" v-if="w_type != ''">
          <label class="label">Value</label>
          <div class="control">
            <div class="select">
              <select v-model="w_source">
                <option value="">Choose an option</option>
                <option v-bind:value="tool.tool" v-for="tool in tools" v-if="w_type == 'gauge' || w_type == 'label'">{{tool.name}}</option>
                <option value="cam-url" v-if="w_type == 'image-container'">Camera feed</option>
                <option value="line_temps" v-if="w_type == 'line-chart'">Tool temperatures</option>
                <option value="pie_stats_printing" v-if="w_type == 'pie-chart'">Print statistics</option>
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

      <dnd-grid-box class="widget" :ref="'gridbox'+box.id" v-for="box in layout" :id="'grid-box'+box.id" :boxId="box.id" :key="box.id" dragSelector=".dragSelector" resizeVisible>
        <div class="card dash-box" v-on:mouseover="boxhover('grid-box'+box.id, 'visible')" v-on:mouseleave="boxhover('grid-box'+box.id, 'hidden')">
          <div class="boxoptions" v-on:click="deleteWidget(box.id)"><i class="far fa-times-circle" style="color: #C0C0C0"></i></div>
          <div class="dash-box-body dragSelector" :id="'bbody'+box.id">
            <widget class="widget dragSelector" :reference="box.type+'_'+box.source" :id="'widget'+box.id" :type="box.type" :source="box.source"></widget>
          </div>
        </div>
      </dnd-grid-box>

    </dnd-grid-container>
  </div>
</template>

<script>
import { Container, Box } from '@dattn/dnd-grid'
import '@dattn/dnd-grid/dist/dnd-grid.css'

import Widget from './dashboard/Widget.vue'

export default {
  components: {
    DndGridContainer: Container,
    DndGridBox: Box,
    'widget': Widget 
  },
  data() {
    return {
      cellSize: {
          w: 20,
          h: 20
      },
      maxColumnCount: Infinity,
      maxRowCount: Infinity,
      bubbleUp: false,
      margin: 15,
      layout: [],
      showAddWidget: "",
      w_title: "Title",
      w_type: "",
      w_source: "",
      widgetData: [],
      debug: ""
    }
  },
  methods: {
    addWidget: function() {
      var widget = {
        id: Math.floor(1000000 + Math.random() * 900000),
        title: this.w_title,
        type: this.w_type,
        source: this.w_source,
        hidden: false,
        pinned: false,
        position: {
            x: 6,
            y: 0,
            w: 5,
            h: 5
        }
      };
      this.layout.push(widget);
      this.showAddWidget = false;
    },
    deleteWidget: function(widgetId) {
      for(var i = 0; i < this.layout.length; i++) {
        if(this.layout[i].id == widgetId) {
          this.layout.splice(i, 1);
        }
      }
    },
    clearWidgets: function() {
      this.layout = [];
    },
    boxhover: function(id, value) {
      $('#'+id+' > div > .boxoptions').css({
        visibility: value
      });
    }
  },
  created: function() {
    
  },
  mounted: function() {
    this.layout = JSON.parse(this.$localStorage.get('dashboardLayout'));
      
  },
  watch: {
    layout: function (before, after) {
      this.$localStorage.set('dashboardLayout', JSON.stringify(this.layout));
    }
  },
  computed: {
    tools: function () {
      var tools = [];
      var temptool = "";
      var tempname = ""
      for(var v in this.temps) {
        tempname = v+" combined temperatures";
        tools.push({
          tool: v,
          name: tempname.charAt(0).toUpperCase() + tempname.slice(1),
        })

        temptool = v+".actual"
        tempname = v+" actual temperature";
        tools.push({
          tool: temptool,
          name: tempname.charAt(0).toUpperCase() + tempname.slice(1),
        })

        temptool = v+".target"
        tempname = v+" target temperature";
        tools.push({
          tool: temptool,
          name: tempname.charAt(0).toUpperCase() + tempname.slice(1),
        })
      }
      return tools;
    }
  }
}
</script>

<style scoped>
#btn_addWidget {
  position: absolute;
  top: 10%; right: 1%;
  z-index: 999;
}
#btn_clearWidgets {
  position: absolute;
  top: 10%; right: 8%;
  z-index: 999;
}

#dashboardPage {
  margin: 50px 20px 20px 20px;
}
#addWidget {
  width: 400px;
  margin: 0 auto;
  position: absolute;
  top: 15%;
  right: 1%;
  z-index: 999;
}
#addWidget .message-body {
  text-align: left;
}
.dash-box {
  width: 100%;
  height: 100%;
}
.dash-box-body {
  width: 100%;
  height: 100%;
  /*display: -ms-flex; display: -webkit-flex; display: flex;*/
}
.boxoptions {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px 5px 0px 0px;
  z-index: 999;
  cursor: pointer;
  visibility: hidden;
}
</style>