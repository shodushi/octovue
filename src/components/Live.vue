<template>
  <section class="section" id="livePage">

    <div class="columns" style="padding-top: 10px;">



      <div class="column is-five-fifths">

        <button id="btn" v-on:click="update()">new pos</button>
        <div id="container"></div>


        
      </div>   


      


    </div>

  </section>
</template>

<script>
import * as Three from 'three'
const OrbitControls = require('three-orbitcontrols')

export default {
  data: function() {
    return  {
      ctx: null,
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      oldvector: {x: 0, y: 0, z: 0},
    }
  },
  mounted: function() {
      this.init();
      this.animate();
      const lines1 = this.fetchGcode(this.$store.state.printingfile.download);
      console.log(this.$store.state.printingfile.download);
      this.gcode = lines1;
  },
  methods: {

    init: function() {
        let container = document.getElementById('container');

        this.camera = new Three.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.01, 10);
        //this.camera = new Three.PerspectiveCamera(90, 4 / 3, .5, 20);
        //this.camera.position.z = 1;


        
        this.camera = new Three.PerspectiveCamera(90, 4 / 3, .5, 100);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);

        this.scene = new Three.Scene(); 
        this.renderer = new Three.WebGLRenderer({antialias: true});
        this.renderer.setClearColor (0xffffff, 1);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        var controls = new OrbitControls(this.camera, this.renderer.domElement);
        container.appendChild(this.renderer.domElement);


        var axesHelper = new Three.AxesHelper( 5 );
        this.scene.add( axesHelper );

        

    },
    animate: function() {
        requestAnimationFrame(this.animate);
        //this.mesh.rotation.x += 0.01;
        //this.mesh.rotation.y += 0.02;
        this.renderer.render(this.scene, this.camera);
    },
    update: function(newx, newy, newz, newe, newf) {
      if(this.$store.state.currentHeight > newz) {
        newz = this.$store.state.currentHeight;
        this.$store.state.oldZ = this.$store.state.currentHeight;
      }
      
      console.log("F: ", this.$store.state.liveF);
      if(parseFloat(this.$store.state.liveE) > 0.0 && this.$store.state.liveF == "") {


        var geometry = new Three.Geometry();
        geometry.vertices.push(
          new Three.Vector3(parseFloat(this.$store.state.oldX), parseFloat(this.$store.state.oldY), parseFloat(this.$store.state.oldZ)),
          new Three.Vector3(parseFloat(newx), parseFloat(newy), parseFloat(newz))
        );
        console.log("before: ",this.$store.state.oldX, this.$store.state.oldY, this.$store.state.oldZ);
        console.log("after: ",newx, newy, newz);
        var line = new Three.Line(geometry, new Three.LineBasicMaterial({
            color: 0x000000
        }));
        this.scene.add(line);
        this.renderer.render(this.scene, this.camera);
        console.log("E: ", this.$store.state.liveE);
      }
      if(this.$store.state.liveF != "") {
        var geometry = new Three.Geometry();
        geometry.vertices.push(
          new Three.Vector3(parseFloat(this.$store.state.oldX), parseFloat(this.$store.state.oldY), parseFloat(this.$store.state.oldZ)),
          new Three.Vector3(parseFloat(newx), parseFloat(newy), parseFloat(newz))
        );
        var line = new Three.Line(geometry, new Three.LineBasicMaterial({
            color: 0xFF0000
        }));
        this.scene.add(line);
        this.renderer.render(this.scene, this.camera);
      }
      
      
    },
    async fetchGcode(url) {
      const response = await fetch(url);

      if (response.status !== 200) {
        throw new Error(`status code: ${response.status}`);
      }

      const file = await response.text();
      var gcode = file.split('\n');
      var z = 0;
      var gcodestring = "";
      for(var i=0; i<gcode.length; i++) {
        const regex = /Z[0-9].* /g;
        var match = gcode[i].match(regex);
        if(match != null && match.length > 0) {
          z = match[0];
        }
        gcodestring = gcodestring + gcode[i] + " "+z+"\n";
      }
      this.gcode = gcodestring;
      //console.log(gcodestring);
      return gcodestring
    },





},
  computed: {
    coords: function() {
      var coords = {"x": this.$store.state.liveX, "y": this.$store.state.liveY, "z": this.$store.state.liveZ, "e": this.$store.state.liveE, "f": this.$store.state.liveF};
      return coords;
    }
  },
  watch: {
    coords: function (before, after) {
      this.update(after.x, after.y, after.z, after.e, after.f);
    }
  },
}

</script>

<style scoped>
#container {
  width: 800px;
  height: 800px;
  border: 1px solid black;
}
</style>