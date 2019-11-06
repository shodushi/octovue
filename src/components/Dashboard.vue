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
          <i class="fas fa-plus"></i>
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
                <option>image-container</option>
                <option>label</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field" style="text-align: left;">
          <label class="label">Value</label>
          <div class="control">
            <div class="select">
              <select v-model="w_source">
                <option>choose</option>
                <option>tool0</option>
                <option>tool0_actual</option>
                <option>tool0_target</option>
                <option>bed</option>
                <option>bed_actual</option>
                <option>bed_target</option>
                <option>cam-url</option>
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
        <div class="card dash-box">
          <div class="boxoptions" :id="'boxoptions'+box.id" v-on:click="deleteWidget(box.id)"><i class="far fa-times-circle" style="color: #C0C0C0"></i></div>
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
            w: 1,
            h: 2
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
    resized: function(el) {
      //console.log(el);
      //var div = document.getElementById(el.path[2].attributes[2].nodeValue);
      //console.log("w: "+div.offsetWidth+";h: "+div.offsetHeight);
      //$('#'+el.path[2].attributes[2].nodeValue).css('font-size: 3.7vmin' );
    }
  },
  created: function() {
    
  },
  mounted: function() {
    this.layout = JSON.parse(this.$localStorage.get('dashboardLayout'));
    var self = this;

    setTimeout(function(){
      
      for(var i = 0;i< self.layout.length;i++) {
        //console.log('#grid-box'+self.layout[i].id);
        //console.log(document.getElementById('grid-box'+self.layout[i].id));

        var el = document.getElementById('grid-box'+self.layout[i].id);
        var resizeElement = el,
          resizeCallback = function() {
        };
        addResizeListener(resizeElement, self.resized);
        
      }
    }, 1000);
    
    
    //$('#test').fitText(13.5, { minFontSize: '50px', maxFontSize: '140px' });
    //this.$localStorage.set('dashboardLayout', "[]");
    //setTimeout(this.fillWidgets, 1);
    //var el = document.getElementById('grid-box1886399');
    //el.addEventListener('update:layout', this.handleDragStart, false);
    //console.log("Test Div:", this.$el)
    //el.addEventListener(event, func);
    //el.on("update:layout", function(e){console.log(e.detail.result)});
    //alert(document.getElementById('test'));
  },
  watch: {
    layout: function (before, after) {
      //console.log(this.layout);
      this.$localStorage.set('dashboardLayout', JSON.stringify(this.layout));
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
.dash-box {
  overflow: hidden;
  padding-bottom: 0%;
}
.dash-box-body {
  width: 100%;
  height: 100%;
  /*display: -ms-flex; display: -webkit-flex; display: flex;*/
}
.dash-box-body>.widget {
  width: 100%;
  height: 100%;
}
.boxoptions {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px 5px 0px 0px;
  z-index: 999;
  cursor: pointer;
}
</style>