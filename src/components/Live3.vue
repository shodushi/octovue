<template>
  <div id="live">
    <h1>GCode Preview Vue Demo</h1>
    <div>{{linesProcessed}}</div>
    <!-- lineWidth values less than 0.01 work best for now -->
    <GCodePreview ref="gcodePreview1" class="gcode-preview"
      :upperLayerLimit="Infinity"
      :topLayerColor="'lime'"
      :lastSegmentColor="'red'"
      :lineWidth="0.004"
    />

    <!-- <div># layers loaded: {{ layersLoaded }}</div> -->
  </div>
</template>

<script>
import GCodePreview from '../components/GCodePreview.vue';
let layersLoaded = 0;
const chunkSize = 500;

export default {
  components: {
    GCodePreview
  },

  data() {
    return {
      layersLoaded : layersLoaded,
      lines: "",
      linesProcessed: 0,
    }
  },


  async mounted() {
    console.log(this.$store.state.selectedfile);
    const lines1 = await this.fetchGcode(this.$store.state.printingfile.download);
    this.loadPreview(this.$refs.gcodePreview1, lines1, 0);

  },
  /*
  mounted: function() {
      //this.loadPreviewChunked(this.$refs.gcodePreview1, this.lines);
      /////for(var i = 0; i < this.$store.state.livegcode.length; i++) {
        ////this.lines = this.lines+"\n"+this.$store.state.livegcode[i];
    ////}
    //this.lines = this.$store.state.livegcode;
    //this.loadPreviewChunked(this.lines, 0, this.lines.length-1);
  },*/
  

  methods : {

    async fetchGcode(url) {
      const response = await fetch(url);

      if (response.status !== 200) {
        throw new Error(`status code: ${response.status}`);
      }

      const file = await response.text();
      return file.split('\n');
    },

    loadPreview(target, lines, delay) {
        const chunk = lines.slice(0, lines.length-1);
        target.processGCode(chunk)
    },
    
    loadPreviewChunked(target, lines, delay) {
      console.log(target.layerCount);
      let c = 0;
      const id = '__animationTimer__' + Math.random().toString(36).substr(2, 9);
      const loadProgressive = (preview) => {
        const start = c*chunkSize;
        const end = (c+1)*chunkSize;
        const chunk = lines.slice(start, end);
        target.processGCode(chunk)
        this.layersLoaded = target.layerCount;
        c++;
        if (c*chunkSize < lines.length) { 
          window[id] = setTimeout(loadProgressive, delay);
        }
      }
      // cancel loading process if one is still in progress
      // mostly when hot reloading
      window.clearTimeout(window[id]);
      loadProgressive(target);
    }
  },
  watch: {
    gcodeBuffer: function (before, after) {
/*
if(after.length > linesProcessed+10) {

        //console.log(this.linesProcessed, after.length-1);
        var lines = after.slice(after.length-10, after.length-1);;
        //console.log(before.length, after.length);
        this.loadPreviewChunked(this.$refs.gcodePreview1, lines, 0);
        this.linesProcessed = after.length;
        
      }
      */
    }
  },
}
</script>

<style>
#live {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.gcode-preview {
  width: 100vw;
  margin: auto;
}
</style>
