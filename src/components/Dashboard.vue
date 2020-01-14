<template>
  <div id="dashboardPage" style="min-height: 800px;">
    <div id="dashboard_buttons">
      <p class="control">
        <button class="button is-small" v-on:click="clearWidgets">
          <span class="icon">
            <i class="fas fa-trash"></i>
          </span>
          <span>{{debug}} clear widgets</span>
        </button>
        <button class="button is-small" v-on:click="lockDashboard"v-if="dashboard_locked">
          <span class="icon">
            <i class="fas fa-lock"></i>
          </span>
          <span>{{db_locked}}</span>
        </button>
        <button class="button is-small" v-on:click="lockDashboard" v-if="!dashboard_locked">
          <span class="icon">
            <i class="fas fa-lock-open"></i>
          </span>
          <span>{{db_locked}}</span>
        </button>
        <button class="button is-small" v-on:click="showAddWidget = true">
          <span class="icon">
            <i class="fas fa-plus"></i>
          </span>
          <span>widget</span>
        </button>
      </p>
    </div>

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
                <option value="printhead">Printhead controls</option>
                <option value="feedrate">Feedrate controls</option>
                <option value="printercommands">Printercommands</option>
                <option value="toolcommands">Toolcommands</option>
                <option value="tempcontrol">Temperature controls</option>
                <option value="terminalwidget">Terminal</option>
                <option value="jobstatus">Jobstatus</option>
                <option value="jobcontrol">Jobcontrol</option>
                <option value="gcodebutton">GCode button</option>
                <option value="filebrowser">Filebrowser</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field" style="text-align: left;" v-if="w_type != '' && w_type != 'printhead' && w_type != 'jobcontrol' && w_type != 'feedrate' && w_type != 'filebrowser' && w_type != 'printercommands' && w_type != 'toolcommands' && w_type != 'terminalwidget' && w_type != 'tempcontrol' && w_type != 'jobstatus'">
          <label class="label">Value</label>
          <div class="control">
            <div class="select">
              <select v-model="w_source" v-if="w_type != 'gcodebutton'">
                <option value="">Choose an option</option>
                <option v-bind:value="tool.tool" v-for="tool in tools" v-if="w_type == 'gauge' || w_type == 'label'">{{tool.name}}</option>
                <option value="cam-url" v-if="w_type == 'image-container'">Camera feed</option>
                <option value="line_temps" v-if="w_type == 'line-chart'">Tool temperatures</option>
                <option value="pie_stats_printing" v-if="w_type == 'pie-chart'">Print statistics</option>
              </select>
            </div>
            <input v-if="w_type == 'gcodebutton'" v-model="w_title" class="input" type="text" placeholder="button text">
            <input v-if="w_type == 'gcodebutton'" v-model="w_source" class="input" type="text" placeholder="gcode command">
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
            <widget class="widget dragSelector" :reference="box.type+'_'+box.source" :id="'widget'+box.id" :type="box.type" :source="box.source" :title="box.title"></widget>
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
      debug: "",
      dashboard_locked: false,
      db_locked: ""
    }
  },
  methods: {
    addWidget: function() {
      var x = 6;
      var y = 0;
      var w = 5;
      var h = 5;
      if(this.w_type == "jobstatus") {
        w = 13;
        h = 6;
      }
      if(this.w_type == "pie-chart") {
        w = 7;
        h = 8;
      }
      if(this.w_type == "line-chart") {
        w = 15;
        h = 8;
      }
      if(this.w_type == "printhead") {
        w = 7;
        h = 7;
      }
      if(this.w_type == "printercommands") {
        h = 15;
      }
      if(this.w_type == "toolcommands") {
        h = 9;
      }
      if(this.w_type == "tempcontrol") {
        h = 8;
      }
      if(this.w_type == "terminalwidget") {
        w = 17;
        h = 7;
      }
      if(this.w_type == "gcodebutton") {
        h = 2;
      }
      if(this.w_type == "filebrowser") {
        w = 18;
        h = 22;
      }
      var widget = {
        id: Math.floor(1000000 + Math.random() * 900000),
        title: this.w_title,
        type: this.w_type,
        source: this.w_source,
        hidden: false,
        pinned: false,
        position: {
            x: x,
            y: y,
            w: w,
            h: h
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
    lockDashboard: function() {
      this.dashboard_locked = !this.dashboard_locked;

      for(var i = 0; i < this.layout.length;i++) {
        this.layout[i].pinned = this.dashboard_locked;
      }
      if(this.dashboard_locked) {
        this.db_locked = "dashboard locked";
      } else {
        this.db_locked = "dashboard unlocked";
      }
      this.$localStorage.set('dashboardLayout', JSON.stringify(this.layout));
      this.$localStorage.set('dashboard_locked', this.dashboard_locked);
    },
    boxhover: function(id, value) {
      if(!this.dashboard_locked) {
        $('#'+id+' > div > .boxoptions').css({
          visibility: value
        });
      }
    }
  },
  created: function() {
    
  },
  mounted: function() {
    this.layout = JSON.parse(this.$localStorage.get('dashboardLayout'));
    this.dashboard_locked = JSON.parse(this.$localStorage.get('dashboard_locked'));
    if(this.dashboard_locked) {
      this.db_locked = "dashboard locked";
    } else {
      this.db_locked = "dashboard unlocked";
    }
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
#dashboard_buttons {
  position: absolute;
  top: 60px; right: 1%;
  z-index: 999;
}
#dashboard_buttons > .control > button {
  margin-right: 0.5em;
}
#btn_clearWidgets {
  position: absolute;
  top: 60px; right: 12%;
  z-index: 999;
}
#btn_addWidget {
  position: absolute;
  top: 60px; right: 1%;
  z-index: 999;
}
#btn_lockWidgets {
  position: absolute;
  top: 60px; right: 8%;
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