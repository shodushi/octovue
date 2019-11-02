<template>
  <div id="dashboardPage" style="min-height: 800px;">
    <dnd-grid-container :layout.sync="layout" :cellSize="cellSize" :maxColumnCount="maxColumnCount" :maxRowCount="maxRowCount" :margin="margin" :bubbleUp="bubbleUp">
      <dnd-grid-box v-for="box in layout" :boxId="box.id" :key="box.id" dragSelector="div.card-header" resizeVisible>
        <div class="card dash-box">
          <div class="dash-box-header">
            Box {{ box.id }}
          </div>
          <div class="dash-box-body">
            body
          </div>
        </div>
      </dnd-grid-box>
    </dnd-grid-container>
  </div>
</template>

<script>
import { Container, Box } from '@dattn/dnd-grid'
import '@dattn/dnd-grid/dist/dnd-grid.css'
export default {
  components: {
    DndGridContainer: Container,
    DndGridBox: Box
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
      layout: [
        {
            id: 1,
            hidden: false,
            position: {
                x: 4,
                y: 0,
                w: 2,
                h: 1
            }
        },
        {
            id: 2,
            hidden: false,
            pinned: false,
            position: {
                x: 6,
                y: 0,
                w: 1,
                h: 2
            }
        },
        {
            id: 3,
            hidden: false,
            pinned: false,
            position: {
                x: 4,
                y: 1,
                w: 2,
                h: 3
            }
        },
        {
            id: 4,
            hidden: false,
            pinned: false,
            position: {
                x: 6,
                y: 2,
                w: 3,
                h: 1
            }
        }
      ]
    }
  },
  methods: {
    onLayoutUpdate (evt) {
        this.layout = evt.layout
    }
  },
  created: function() {
  },
  mounted: function() {
    console.log(this.$router);
  }

}
</script>

<style scoped>


</style>