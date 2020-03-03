<template>
  <div>
    <button id="btn" v-on:click="add()">new pos</button>
  <div
    id="canvas"
    ref="canvas"
  />
  </div>
</template>

<script>
import{
  WebGLRenderer,
  PerspectiveCamera,
  MOUSE,
  Scene,
  Color,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  DirectionalLight
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import GCodeParser from './gcode-parser.js';
export default {
  props: {
    bed: {
      type: Object,
      default: function () {
        return { X: 22.3, Y: 22.3 }
      }
    },
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
        return { extrusionColor: "#4287f5",pathColor: "#0a2f6b",bedColor: "#586375",backgroundColor: "#dfe4ed" }
      }
    },
  },
  data: () => ({
    camera: null,
    controls: null,
    scene: null,
    plane: null,
    object: {
      extrusion: null,
      path: null
    },
    renderer: null,
    destroyed: false,
    gcode: "",

    dialog: true,

  }),
  watch: {
    gcode: function() {
      this.animate;
    },
    livegcodestring: function() {
      //this.gcode = this.$store.state.livegcodestring;
      //console.log(this.gcode);
      //this.animate;
    },
    //Update model
    gcode: function () 
    {
      const parser = new GCodeParser(
        this.theme.extrusionColor,
        this.theme.pathColor
      );
      parser.parse(this.gcode).then(object => 
      {
        //Store for later manipulation
        this.object = object;
        this.setRotation();
        this.setScale();
        this.setPosition();
        //Add to scene
        this.scene.add(object.extrusion);
        this.scene.add(object.path);
      });
    },
    //Update plane
    bed: {
      deep: true,
      handler: 'setPlane'
    },
    //Update position
    position: {
      deep: true,
      handler: 'setPosition'
    },
    //Update rotation
    rotation: {
      deep: true,
      handler: 'setRotation'
    },
    //Update scale
    scale: {
      deep: true,
      handler: 'setScale'
    },
    //Update theme
    theme: {
      deep: true,
      handler: 'setTheme'
    }
  },
  //Setup
  mounted: function () 
  {
    console.log(this.$store.state.selectedfile);
    const lines1 = this.fetchGcode(this.$store.state.printingfile.download);
    
    this.gcode = lines1;
    console.log(this.gcode);


    this.animate;
    //Renderer
    this.bed.X = 22.3;
    this.bed.Y = 22.3;
    this.bed.Y = 0.0;
    this.renderer = new WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.$refs.canvas.clientWidth,
      this.$refs.canvas.clientHeight
    );
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.$refs.canvas.appendChild(this.renderer.domElement);
    //Camera
    this.camera = new PerspectiveCamera(
      50,
      this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(0, this.bed.X / 2, -this.bed.Y);
    //Orbit controls
    this.controls = new OrbitControls(this.camera, this.$refs.canvas);
    this.controls.rotateSpeed = 0.7;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE
    };
    //Scene
    this.scene = new Scene();
    this.scene.background = new Color(this.theme.backgroundColor);
    //Plane
    this.plane = new Mesh(
      new PlaneBufferGeometry(),
      new MeshBasicMaterial({color: new Color(this.theme.bedColor)})
    );
    this.plane.rotation.x = -Math.PI / 2;
    this.setPlane();
    this.scene.add(this.plane);
    //Subscribe resize function to resize event
    window.addEventListener('resize', this.resize);
    //Start
    this.animate();
  },
  //Cleanup
  destroyed: function () 
  {
    //Unsubscribe resize function to resize event
    window.removeEventListener('resize', this.resize);
    //Clean everything in the scene
    this.scene.children.forEach(object => 
    {
      //Geometry
      if (
        object.geometry != null &&
        typeof object.geometry.dispose == 'function'
      ) 
      {
        object.geometry.dispose();
      }
      //Material
      if (
        object.material != null &&
        typeof object.material.dispose == 'function'
      ) 
      {
        object.material.dispose();
      }
    });
    //Disable animation loop
    this.destroyed = true;
    //Delete scene and camera
    delete this.scene;
    delete this.camera;
    //Dispose of controls and renderer
    this.controls.dispose();
    this.renderer.dispose();
  },
  methods: {
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
    add: function() {
      this.gcode = "G1 X43.116 Y45.295 Z0.0 E5.9764\nG1 X43.116 Y45.725 E5.9927\nG1 X63.176 Y45.725 E6.7533\nG1 X63.176 Y45.295 E6.7696\nG1 X75.116 Y45.295 E7.2223\nG1 X75.116 Y45.725 E7.2386\nG1 X83.116 Y45.725 E7.5420\nG1 X83.116 Y46.495 E7.5712\nG1 X23.176 Y46.495 E9.8439\nG1 X23.176 Y47.695 E9.8894\nG1 X83.116 Y47.695 E12.1621\nG1 X83.116 Y48.895 E12.2076\nG1 X23.176 Y48.895 E14.4803\nG1 X23.176 Y50.095 E14.5258\nG1 X83.116 Y50.095 E16.7985\nG1 X83.116 Y51.295 E16.8440\n";
    },
    //Set plane size
    setPlane: function () 
    {
      const {X, Y} = this.bed;
      this.plane.scale.set(X, Y, 1);
    },
    //Set object position
    setPosition: function () 
    {
      const {X, Y, Z} = this.position;
      this.object.extrusion.position.set(X, Y, Z);
      this.object.path.position.set(X, Y, Z);
    },
    //Set object rotation
    setRotation: function () 
    {
      let {X, Y, Z} = this.rotation;
      X *= Math.PI / 180;
      Y *= Math.PI / 180;
      Z *= Math.PI / 180;
      this.object.extrusion.rotation.set(X, Y, Z);
      this.object.path.rotation.set(X, Y, Z);
    },
    //Set object scale
    setScale: function () 
    {
      const {X, Y, Z} = this.scale;
      this.object.extrusion.scale.set(Z, X, Y);
      this.object.path.scale.set(Z, X, Y);
    },
    //Set theme
    setTheme: function () 
    {
      this.object.extrusion.material.color.set(this.theme.extrusionColor);
      this.object.path.material.color.set(this.theme.pathColor);
      this.plane.material.color.set(this.theme.bedColor);
      this.scene.background.set(this.theme.backgroundColor);
    },
    //Animate motion
    animate: function () 
    {
      if (!this.destroyed) 
      {
        this.controls.update();
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
      }
    },
    //Resize function
    resize: function () 
    {
      //Update renderer size
      this.renderer.setSize(
        this.$refs.canvas.clientWidth,
        this.$refs.canvas.clientHeight
      );
      //Update camera aspect ratio
      this.camera.aspect =
        this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }
};
</script>

<style>
#canvas {
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>