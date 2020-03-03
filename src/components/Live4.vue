<template>
  <section class="section" id="livePage">
    <button v-on:click="show()">show</button><button v-on:click="hide()">hide</button>
    <div>Layers loaded: {{objects.length}} ||   current layer: {{currentlayer}} ({{currentlayerheight}}) ||   current height: {{ currentHeight }}</div>
    <div id="canvas" ref="canvas" /></div>
  </section>
</template>

<script>
import * as Three from 'three';
import * as THREE from 'three';
import{
  WebGLRenderer,
  PerspectiveCamera,
  MOUSE,
  Scene,
  Color,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  DirectionalLight,
  Line3,
  Vector3
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import GCodeLoader from 'three-gcode-loader';
export default {
  props: {
    position: {
      type: Object,
      default: function () {
        return { X: 11.15,Y: 0,Z: 11.15 }
      }
    },
    rotation: {
      type: Object,
      default: function () {
        return { X: -90,Y: 0,Z: 180 }
      }
    },
    scale: {
      type: Object,
      default: function () {
        return { X: 0.1,Y: 0.1,Z: 0.1 }
      }
    },
    theme: {
      type: Object,
      default: function () {
        return { extrusionColor: "#4287f5", pathColor: "#0a2f6b",bedColor: "#999999",backgroundColor: "#e6f0f7" }
      }
    },
  },
  data: function() {
    return  {
      ctx: null,
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      oldvector: {x: 0, y: 0, z: 0},
      loaded: 0,
      layers: [],
      currentlayer: "0",
      currentlayerheight: "",
      obj: null,
      objects: [],
      bed: null,
      extruder: null,
      printedObject: new THREE.Geometry(),
      mesh: null,
    }
  },
  mounted: function() {
    var loader = new GCodeLoader()
    this.init();
    var self = this;
    this.currentHeight = 0;
    //this.$store.state.printingfile.download
    //"http://127.0.0.1:5000/downloads/files/local/3DBenchy.gcode"
    loader.load(this.$store.state.printingfile.download, function (data) {
        var layers = data[0];
        //var layerIndices = data[1];
        self.layers = layers;
        self.loaded = 1;
        layers = null;
        data = null;
    });
  },
  watch: {
    loaded: function(after, before) {
        if(before == 0 && after == 1) {
          this.setModel(this.layers);
        }
    },
    livegcodestring: function (after, before) {
      this.moveTool(after.x, after.y, after.z);
    },
    currentHeight: function(after, before) {
      if(before != after) {
        this.updateModel();
      }
    },
  },
  methods: {
    show: function() {
      this.printedObject.visible = true;
    },
    hide: function() {
      this.printedObject.visible = false;
    },  
    init: function() {
      Three.Object3D.DefaultUp.set(0,0,1);
      Three.Object3D.Def
      this.renderer = new WebGLRenderer({antialias: true});
      //this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(
      this.$refs.canvas.clientWidth,
      this.$refs.canvas.clientHeight
      );
      this.renderer.gammaInput = true;
      this.renderer.gammaOutput = true;
      this.renderer.shadowMap.enabled = true;
      this.$refs.canvas.appendChild(this.renderer.domElement);

      //Scene
      this.scene = new Scene();
      this.scene.background = new Color(this.theme.backgroundColor);
      //var axesHelper = new Three.AxesHelper(80);
      //this.scene.add( axesHelper );
      
      //Bed
      var geometry = new THREE.PlaneBufferGeometry( 210, 210, 0 );
      //var material = new THREE.MeshBasicMaterial( {color: new Color(this.theme.bedColor)} );
      var texture = new THREE.TextureLoader().load( 'textures/bed_texture.png' );
      var material = new THREE.MeshBasicMaterial( { map: texture } );
      this.bed = new THREE.Mesh( geometry, material );
      this.bed.position.set(105,105,0);
      this.scene.add( this.bed );


      //Camera
      this.camera = new PerspectiveCamera(45, this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight, 0.1, 1000);
      //                                  Z
      this.camera.position.set(105, -140, 120);

      //Orbit controls
      this.controls = new OrbitControls(this.camera, this.$refs.canvas);
      this.controls.rotateSpeed = 0.7;
      this.controls.minDistance = 1;
      this.controls.maxDistance = 5000;
      this.controls.minPolarAngle = 0;
      this.controls.maxPolarAngle = Math.PI;
      this.controls.mouseButtons = {
        LEFT: MOUSE.PAN,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE
      };
      this.controls.target.copy(this.bed.position);
      this.controls.update();
      
      //Extruder
      var geometry = new THREE.CylinderGeometry( 1, 1, 10, 22 );
      var material = new THREE.MeshBasicMaterial( {color: 0x1a1a1a} );
      this.extruder = new THREE.Mesh( geometry, material );
      //                    Y   X  Z
      this.extruder.position.set(0, 0, 0+this.extruder.geometry.parameters.height/2);
      this.extruder.rotation.x = -90 * Math.PI/180
      this.scene.add( this.extruder );

      //Light
      var light = new THREE.PointLight( 0xffff00, 1, 100 );
      light.position.set( 50, 50, 50 );
      //this.scene.add( light );
      
      //Subscribe resize function to resize event
      window.addEventListener('resize', this.resize);

      var material = new THREE.MeshLambertMaterial({
          color: 0x00afaf,
          side: THREE.DoubleSide
      });
      this.mesh = new THREE.Mesh(this.printedObject, material);
      this.mesh.position.set(50,50,0);
      this.scene.add(this.mesh);


      //Start
      this.animate();
    },
    animate: function() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    },

    setModel: function(array) {
        var material = new Three.LineBasicMaterial( { color: new THREE.Color("rgb(255,171,81)") } );
        var positions = [];

        var layers = [];
        for(var i = 0; i < array.length; i++) {
            var layer = array[i];
            positions = null;
            positions = [];
            layers[i] = new Three.BufferGeometry();
            for(var n = 0; n < layer.length; n++) {
                var lines = layer[n];
                for(var l = 0; l < lines.length; l++) {
                    positions.push( lines[l].x, lines[l].y, lines[l].z );
                }
            }
            layers[i].setAttribute( 'position', new Three.Float32BufferAttribute( positions, 3 ) );
            layers[i].computeBoundingSphere();
            var temp = new Three.Line(layers[i], material);
            //temp.rotation.z = -90 * Math.PI/180
            temp.visible = false;
            this.objects.push(temp);
            
        }
        
        for(var n=0;n<this.objects.length;n++) {
          this.objects[n].matrixAutoUpdate  = false;
          this.objects[n].updateMatrix();
          this.scene.add(this.objects[n]);
        }
       
        array = null;
        temp = null;
        layers = null;
        layer = null;
        positions = null;
        this.layers = null;
    },
    updateModel: function() {
      for(var n=0;n<this.objects.length;n++) {
        if(Number(this.objects[n].geometry.attributes.position.array[2]).toFixed(3) < Number(this.currentHeight).toFixed(3)) {
          //this.objects[n].material.color.setRGB( 250,171,81 );
          if(this.objects[n].material != new Three.LineBasicMaterial( { color: new THREE.Color("rgb(255,171,81)")})) {
            this.objects[n].material = new Three.LineBasicMaterial( { color: new THREE.Color("rgb(255,171,81)") } );
            this.objects[n].material.colorsNeedUpdate = true;
            this.objects[n].visible = true;
            
            /*
            mesh merging
            if(n> 0) {
              var g = new THREE.Geometry;
              var a = this.objects[n-1].geometry.attributes.position.array;
              for (var i = 0; i < a.length; i+=3) {
                g.vertices.push (new THREE.Vector3 (a[i], a[i+1], a[i+2]));
              }
              var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
              var mesh = new THREE.Mesh( g, material );
              mesh.updateMatrix();
              this.printedObject.merge(mesh.geometry, mesh.matrix);
              this.mesh.updateMatrix();
              this.scene.remove(this.mesh);
              var material = new THREE.MeshLambertMaterial({
                  color: 0x00afaf,
                  side: THREE.DoubleSide
              });
              this.mesh = new THREE.Mesh(this.printedObject, material);
              this.mesh.position.set(50,50,0);
              this.scene.add(this.mesh);
              //this.objects[n-1].visible = false;
            }
            */
          }
        }
        if(Number(this.objects[n].geometry.attributes.position.array[2]).toFixed(3) == Number(this.$store.state.currentHeight).toFixed(3)) {
          //this.objects[n].material.color.setRGB( 0, 155, 0 );
          this.objects[n].material = new Three.LineBasicMaterial( { color: new THREE.Color("rgb(0,155,0)") } );
          this.objects[n].material.colorsNeedUpdate = true;
          this.objects[n].visible = true;
          this.currentlayer = n+1;
          this.currentlayerheight = Number(this.objects[n].geometry.attributes.position.array[2]).toFixed(3);
          break;
        }
      }
    },
    moveTool: function(x, y, z) {
      this.extruder.position.set(parseFloat(x), parseFloat(y), parseFloat(z)+this.extruder.geometry.parameters.height/2);
    },

    //Set theme
    setTheme: function () {
      this.object.extrusion.material.color.set(this.theme.extrusionColor);
      this.object.path.material.color.set(this.theme.pathColor);
      this.plane.material.color.set(this.theme.bedColor);
      this.scene.background.set(this.theme.backgroundColor);
    },
    //Animate motion
    animate: function () {
      if (!this.destroyed) 
      {
        this.controls.update();
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
      }
    },
    //Resize function
    resize: function () {
      //Update renderer size
      this.renderer.setSize(
        this.$refs.canvas.clientWidth,
        this.$refs.canvas.clientHeight
      );
      //Update camera aspect ratio
      //this.camera.aspect =
      this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  },
}

</script>

<style>
#canvas {
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>