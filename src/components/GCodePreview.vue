<template>
  <div>
    <canvas ref="preview"></canvas>
  </div>
</template>

<script>
'use strict'

import { WebGLPreview } from 'gcode-preview';
import * as THREE from 'three';

export default {
  props: {
    topLayerColor: String,
    lastSegmentColor: String,
    upperLayerLimit: Number,
    lineWidth: Number
  },

  data() {
    return {
      layerCount: 0
    }
  },

  mounted() {
    this.preview = new WebGLPreview({
      canvas: this.$refs.preview,
      limit: this.upperLayerLimit,
      topLayerColor: new THREE.Color(this.topLayerColor).getHex(),
      lastSegmentColor: new THREE.Color(this.lastSegmentColor).getHex(),
      lineWidth: this.lineWidth
    });

    window.addEventListener('resize', () => {
      this.preview.resize();
    });
  },

  methods: {
    processGCode(gcode) {
      this.preview.processGCode(gcode);
      this.layerCount = this.preview.layers.length;
    }
  }
}
</script>
<style scoped>
  canvas {
    outline: none;
    width: 100%;
    height: 100%;
  }
</style>