import P5 from "p5";
import { Dw } from "./lib/p5.easycam";
// import "p5.easycam";

/*
//? good ref:
    * 3d render+ lightning: https://diwi.github.io/p5.EasyCam/examples/RandomBoxes/
    * 3d pan/zoom: +easycam:  https://editor.p5js.org/stungeye/sketches/LLSWwD_kA
    * Voxel Map Editor: https://editor.p5js.org/fsynthesizer/sketches/1Ie4k-Wwm

*/

// console.log('p5=', P5)
import { Renderer } from ".";
import { BoolArray, BoolArray2D } from "../helpers/datastructures";

export class P5EasycamRenderer extends Renderer {
   private static _canvas = document.createElement("canvas");
   private sketch: P5;

   constructor() {
      super();
      const windowWidth=400, windowHeight=400;
      let easycam;
      const sketch = (p5: P5) => {
         p5.setup = () => {
            // this.sketch = p5;
            let canvas1 = p5.createCanvas(400, 400, p5.WEBGL, this.canvas);
            // this.canvas.oncontextmenu = () => false;
            // this.canvas.oncontextmenu = function() {return false};
            p5.setAttributes('antialias', true);
            easycam = new Dw.EasyCam(p5._renderer, {distance:300, center:[0,0,0] /* , rotation:[1,0,0,0] */});
            // easycam = new Dw.EasyCam(p5._renderer);
            // easycam = p5.createEasyCam()
            //   canvas1.position(0,0);
            easycam.setViewport([0,0,windowWidth, windowHeight]);
            document.oncontextmenu = function() {return false};
            // p5.noLoop();
         };
         p5.windowResized = () => {
            p5.resizeCanvas(windowWidth, windowHeight);
            easycam.setViewport([0,0,windowWidth, windowHeight]);
          }
         p5.draw = function () {
            //for canvas 1
            p5.background(100);
            p5.lights();
            // p5.noStroke()
            // p5.ambientLight(100);
            // p5.pointLight(255, 255, 255, 0, 0, 0);

            // p5.rotateX(p5.frameCount * 0.01);
            // p5.rotateY(p5.frameCount * 0.02);
            // p5.rotateZ(p5.frameCount * 0.05);
            p5.cone(30, 150);
            // p5.ambientMaterial(255,250,200);
         };
      };
      this.sketch = new P5(sketch);
   }

   public get canvas(): HTMLCanvasElement {
      return P5EasycamRenderer._canvas;
   }
   update(MX: number, MY: number, MZ: number): void {
      // throw new Error("Method not implemented.");
   }
   protected _render(state: Uint8Array): void {
      // throw new Error("Method not implemented.");
      //   this.sketch.redraw()
      if (!this.sketch.isLooping()) {
         //   this.sketch.redraw()
         this.sketch.loop();
      }
   }
   public done() {
      this.sketch.noLoop();
   }
   clear(): void {
      // throw new Error("Method not implemented.");
   }
   dispose(): void {
      // throw new Error("Method not implemented.");
   }
}
