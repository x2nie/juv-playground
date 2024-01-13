import P5 from "p5";

/*
//? good ref:
    * 3d render+ lightning: https://diwi.github.io/p5.EasyCam/examples/RandomBoxes/
    * 3d pan/zoom: +easycam:  https://editor.p5js.org/stungeye/sketches/LLSWwD_kA
    * Voxel Map Editor: https://editor.p5js.org/fsynthesizer/sketches/1Ie4k-Wwm

*/

// console.log('p5=', P5)
import { Renderer } from ".";
import { BoolArray, BoolArray2D } from "../helpers/datastructures";

export class P5BasicRenderer extends Renderer {
   private static _canvas = document.createElement("canvas");
   private sketch: P5;

   constructor() {
      super();
      const sketch = (p5: P5) => {
         p5.setup = () => {
            // this.sketch = p5;
            let canvas1 = p5.createCanvas(400, 400, p5.WEBGL, this.canvas);
            //   canvas1.position(0,0);
            p5.noLoop()
         };
         p5.draw = function () {
            //for canvas 1
            p5.background(100);
            p5.rotateX(p5.frameCount * 0.01);
            p5.rotateZ(p5.frameCount * 0.01);
            p5.cone(30, 50);
         };
      };
      this.sketch = new P5(sketch);
   }

   public get canvas(): HTMLCanvasElement {
      return P5BasicRenderer._canvas;
   }
   update(MX: number, MY: number, MZ: number): void {
      // throw new Error("Method not implemented.");
   }
   protected _render(state: Uint8Array): void {
      // throw new Error("Method not implemented.");
    //   this.sketch.redraw()
    if(!this.sketch.isLooping()){
              this.sketch.redraw()
            // this.sketch.loop()
        }
   }
   public done(){
        this.sketch.noLoop()
   }
   clear(): void {
      // throw new Error("Method not implemented.");
   }
   dispose(): void {
      // throw new Error("Method not implemented.");
   }
}
