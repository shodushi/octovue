/**
 * @fileoverview GCODE parser
 * Based on https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/GCodeLoader.js
 * @author tentone
 * @author joewalnes
 * @author wakeful-cloud
 */

import
{
  LineBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Line
} from 'three';

/**
 * @class GCodeParser GCODE parser
 */
export default class GCodeParser
{
  /**
   * @param {Color} extrusionColor
   * @param {Color} pathColor
   */
  constructor(extrusionColor, pathColor)
  {
    this.extrusionMaterial = new LineBasicMaterial({color: extrusionColor});
    this.pathMaterial = new LineBasicMaterial({color: pathColor});
  }

  /**
   * Parse GCODE
   * @param {String} gcode The raw GCODE
   * @returns {Promise<Object>}
   */
  parse(gcode)
  {
    //Parse asynchronously and without blocking Three.JS
    return new Promise(resolve =>
    {
      //Variables
      const extrusionVertices = [];
      const pathVertices = [];
      let state = {x: 0, y: 0, z: 0, e: 0, f: 0};
      let relative = false;

      //Remove comments
      gcode = gcode.replace(/;.+/g, '').split('\n');

      //Parse commands
      for (let i = 0; i < gcode.length; i++)
      {
        //Parse tokens
        let tokens = gcode[i].split(' ');
        const command = tokens[0].toUpperCase();
        const args = {};
        tokens = tokens.splice(1);

        //Parse arguments
        for (let i = 0; i < tokens.length; i++)
        {
          //If not null, store argument
          if (tokens[i][0] != null)
          {
            const key = tokens[i][0].toLowerCase();
            const value = parseFloat(tokens[i].substring(1));
            args[key] = value;
          }
        }

        //Convert GCODE to Three.JS land

        //Linear move
        if (command == 'G0' || command == 'G1')
        {
          const line = {
            x: args.x != null ? absolute(relative, state.x, args.x) : state.x,
            y: args.y != null ? absolute(relative, state.y, args.y) : state.y,
            z: args.z != null ? absolute(relative, state.z, args.z) : state.z,
            e: args.e != null ? absolute(relative, state.e, args.e) : state.e,
            f: args.f != null ? absolute(relative, state.f, args.f) : state.f
          };
          //console.log(state);
          //Extruding
          if (delta(relative, state.e, line.e) > 0)
          {
            extrusionVertices.push(line.x, line.y, line.z);
          }
          //Path
          else
          {
            pathVertices.push(line.x, line.y, line.z);
          }

          //Update position
          state = line;
        }
        //Absolute positioning
        else if (command == 'G90')
        {
          relative = false;
        }
        //Relative positioning
        else if (command == 'G91')
        {
          relative = true;
        }
        //Set position
        else if (command == 'G92')
        {
          state = args;
        }
      }

      //Object generation
      const extrusionBuffer = new BufferGeometry();
      const pathBuffer = new BufferGeometry();

      extrusionBuffer.addAttribute(
        'position',
        new Float32BufferAttribute(extrusionVertices, 3)
      );
      pathBuffer.addAttribute(
        'position',
        new Float32BufferAttribute(pathVertices, 3)
      );

      const extrusionObject = new Line(extrusionBuffer, this.extrusionMaterial);
      const pathObject = new Line(pathBuffer, this.pathMaterial);

      //Cleanup
      this.extrusionMaterial.dispose();
      this.pathMaterial.dispose();
      extrusionBuffer.dispose();
      pathBuffer.dispose();

      return resolve({extrusion: extrusionObject, path: pathObject});
    });
  }
}

//Calculate the delta between 2 vertices
function delta(relative, vertex1, vertex2)
{
  return relative ? vertex2 : vertex2 - vertex1;
}

//Calculate the absolute value between 2 vertices
function absolute(relative, vertex1, vertex2)
{
  return relative ? vertex1 + vertex2 : vertex2;
}
