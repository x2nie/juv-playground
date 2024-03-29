import { Random } from "./random";
// import {
//     action,
//     computed,
//     makeObservable,
//     observable,
//     runInAction,
// } from "mobx";

import {
    BitmapRenderer,
    IsometricRenderer,
    VoxelPathTracer,
    Renderer,
    P5BasicRenderer,
    P5EasycamRenderer,
    ThreeRenderer,
    TriangulaionRenderer,
} from "./render";

import { Helper } from "./helpers/helper";
import { Loader } from "./helpers/loader";
import { VoxHelper } from "./helpers/vox";
import { Interpreter } from "./interpreter";

// import ModelsXML from "../static/models.xml";
// import PaletteXML from "../static/resources/palette.xml";
import { NodeState, NodeStateInfo } from "./state";
import { Node } from "./nodes";

export type ProgramOutput = { name: string; buffer: ArrayBuffer };

export interface ProgramParams {
    steps?: number;
}

const Render3DTypes = {
    isometric: IsometricRenderer,
    voxel: VoxelPathTracer,
    p5basic: P5BasicRenderer,
    p5easycam: P5EasycamRenderer,
    threejs: ThreeRenderer,
    triangulation: TriangulaionRenderer,
};

export class Program {
    //* @observable.ref
    public instance: Model = null;

    //* @observable
    // public models: Map<string, Element> = new Map();
    public models: Element[] = [];

    //* @observable
    public palette: Map<string, Uint8ClampedArray> = new Map();

    public meta = new Random();

    //* @observable
    private _speed = 0;

    constructor(modelsXml:string, paletteXml: string) {
        this.loadModels(modelsXml)
        this.loadPalette(paletteXml)
    }
    //* @action
    public loadPalette(paletteXml:string) {
        const ep = Loader.xmlParse(paletteXml);
        const ecolors = [...Helper.childrenByTag(ep, "color")];
        this.palette = new Map(
            ecolors.map((e) => [
                e.getAttribute("symbol").charAt(0),
                Helper.hex2rgba(e.getAttribute("value"), Number(e.getAttribute("alpha")||'255')),
            ])
        );
    }

    //* @action
    public loadModels(modelsXml:string) {
        const doc = Loader.xmlParse(modelsXml);
        // this.models.clear();

        for (const emodel of Helper.childrenByTag(doc, "model")) {
            this.models.push(emodel)
            // const name = emodel.getAttribute("name")?.toUpperCase() || "MODEL";

            // const tryInsert = (suffix: number = null) => {
            //     const n = suffix === null ? name : `${name}_${suffix}`;

            //     if (!this.models.has(n)) {
            //         this.models.set(n, emodel);
            //     } else tryInsert(suffix ? suffix + 1 : 1);
            // };

            // runInAction(tryInsert);
        }
    }

    //* @action
    public load(modelIndex: number) {
        const model = new Model(modelIndex, this);
        if (!model) return null;
        // runInAction(() => {
            if (this.instance) this.instance.stop();
            this.instance = model;
        // });
        return model;
    }

    public set speed(n: number) {
        this._speed = n;
        if (this.instance) {
            this.instance.speed = n
        }
    }

    //* @computed
    public get speed() {
        return this._speed
        // if (this.instance) {
        //     return this.instance.speed 
        // }
        // return 0
    }    
    public set seed(n: number) {
        // this._speed = n;
        if (this.instance) {
            this.instance.seed = n
        }
    }

    //* @computed
    public get seed() {
        // return this._speed
        if (this.instance) {
            return this.instance.seed 
        }
        return 0
    }

    get running():boolean{
        if (this.instance) {
            return this.instance.running
        } 
        else return false
    }

    get paused():boolean{
        if (this.instance) {
            return this.instance.paused
        } 
        else return false
    }
}

export class Model {
    public readonly key: string;
    public readonly name: string;

    private readonly modelDescriptor: Element;
    private modelDoc: Element;

    private ip: Interpreter;
    private breakpoints: Set<Node> = new Set();

    //* @observable
    public renderer: Renderer;

    //* @observable
    private _curr: Generator<[Uint8Array, string, number, number, number]> =
        null;

    //* @observable
    private _seed: number = null;
    //* @observable
    private _speed = 0;
    //* @observable
    private _delay = 0;
    //* @observable
    private _paused = false;

    private _loadPromise: Promise<boolean>;
    private _timer = 0;
    private _steps = -1;

    private default3DrenderType = /*VoxelPathTracer.supported
        ? "voxel"
        :*/ 
        // "isometric"
        // "p5basic"
        // "p5easycam"
        // "threejs"
        "triangulation"
        ;
    private rendered = 0;
    private lastLoop = 0;

    //* @observable
    public loading = false;

    //* @observable
    public output: ProgramOutput = null;

    //* @observable.deep
    public nodes: NodeStateInfo[] = [];
    //* @observable
    public curr_node_index = -1;

    public readonly DIM = new Int32Array([-1, -1, -1]);

    constructor(modelIndex: number, private program: Program) {
        // this.key = key;
        this.speed = program.speed;

        if (!program.palette) {
            console.error("Load palette first before running any model");
        }

        const emodel = this.modelDescriptor = program.models[modelIndex];
        if (!this.modelDescriptor) return;

        const name = (this.name = emodel.getAttribute("name"));
        const size = parseInt(emodel.getAttribute("size")) || -1;
        const dimension = parseInt(emodel.getAttribute("d")) || 2;

        this.DIM[0] = parseInt(emodel.getAttribute("length")) || size;
        this.DIM[1] = parseInt(emodel.getAttribute("width")) || size;
        this.DIM[2] =
            parseInt(emodel.getAttribute("height")) ||
            (dimension === 2 ? 1 : size);

        this.renderer =
            this.DIM[2] === 1
                ? new BitmapRenderer()
                : new Render3DTypes[this.default3DrenderType]();

        this.renderer.clear();

        document
            .getElementById("model-canvas")
            .replaceWith(this.renderer.canvas);
        this.renderer.canvas.id = "model-canvas";

        this._loadPromise = (async () => {
            const path = `/static/models/${name}.xml`;
            const mdoc = (this.modelDoc = await Loader.xml(path));

            if (!mdoc) {
                console.error(`Failed to load ${path}`);
                return false;
            }

            const seedString = emodel.getAttribute("seeds");
            const seeds = seedString?.split(" ").map((s) => parseInt(s));

            const customPalette = new Map(this.program.palette.entries());
            for (const ec of Helper.childrenByTag(emodel, "color")) {
                customPalette.set(
                    ec.getAttribute("symbol").charAt(0),
                    Helper.hex2rgba(ec.getAttribute("value"))
                );
            }

            this.ip = await Interpreter.load(
                this.modelDoc,
                this.DIM[0],
                this.DIM[1],
                this.DIM[2]
            );

            // runInAction(() => {
                this.nodes = NodeState.traverse(this.ip);
                for (const { state } of this.nodes) state.sync();

                this.renderer.palette = customPalette;
                this._seed = seeds?.[0] || this.program.meta.Next();
            // });

            const [state, chars, FX, FY, FZ] = this.ip.state();

            this.renderer.setCharacters(chars);
            this.renderer.update(FX, FY, FZ);
            this.renderer.render(state);

            return true;
        })();

        // makeObservable(this);
    }

    //* @action
    public debug() {
        debugger;
    }

    //* @action
    public load() {
        return this._loadPromise;
    }

    //* @computed
    public get paused() {
        return this._paused;
    }

    public set speed(n: number) {
        if (n <= 0) {
            this._speed = 0;
            this._delay = Math.abs(n);
        } else {
            this._speed = Math.floor(n);
            this._delay = 0;
        }
    }

    //* @computed
    public get speed() {
        return this._delay ? -this._delay : this._speed;
    }

    //* @computed
    public get running() {
        return !!this._curr;
    }

    //* @computed
    public get seed() {
        return this._seed;
    }
    public set seed(n: number) {
        this.set_seed(n);
    }

    //* @action
    public set_seed(seed:number|string) {
        this._seed = Number(seed)
    }

    //* @action
    public async start(params?: ProgramParams) {
        console.log('delay:', this._delay)
        if (this._curr) this._curr.throw(new Error("Interrupt"));
        this._curr = null;
        this.output = null;

        if (this.loading) return Promise.resolve(false);
        this.loading = true;

        return this._loadPromise.then(async (loaded) => {
            if (!loaded) return false;

            this._steps = params?.steps || -1;

            // runInAction(() => {
                this.loading = false;
                this._timer = 0;
                this._paused = false;
                this.loop();
            // });

            return true;
        });
    }

    //* @action
    public restart() {
        this._paused = true;
        this._curr = null;
        this.start()
    }

    //* @action
    public pause() {
        this._paused = true;
    }

    //* @action
    public resume() {
        this._paused = false;
        this.loop();
    }

    //* @action
    public step() {
        this._paused = true;
        this.loop(true);
    }

    //* @action
    public randomize() {
        this._seed = this.program.meta.Next();
    }

    private scaleTime(t: number) {
        if (this._speed > 0) {
            return t * this._speed;
        } else return t;
    }

    private _result : any = null;
    private _lastCounter: number = 0;
    private _drawing = false;

    private draw() {
        requestAnimationFrame(() => this.draw())

        if(this._lastCounter == this.ip?.counter) return;
        if(!this._result) return;
        if(this._drawing) return;
        
        this._lastCounter == this.ip?.counter;
        this._drawing = true;
        const [state, chars, FX, FY, FZ] = this._result;

        this.ip.onRender();
        this.renderer.setCharacters(chars);
        this.renderer.update(FX, FY, FZ);
        this.renderer.render(state);
        this.rendered++;
        
        this._drawing = false;
        // requestAnimationFrame(() => this.draw())
    }

    private loop10(once = false, render = true) {
        if (!once && this._paused) return;
        // debugger

        
        if (!this._curr) this._curr = this.ip?.run(this._seed, this._steps);
        if (!this._curr) return;
        
        let result = this._curr.next();
        this._result = result.value;
        
        requestAnimationFrame(() => this.draw())
        
        while (!result.done && !this._paused){
            for (const { state } of this.nodes) state.sync();
            result = this._curr.next();
            if(result && result.value){
                this._result = result.value;
                requestAnimationFrame(() => this.draw())
            }
        }

    }
    private loop(once = false, render = true) {
        if (!once && this._paused) return;

        const start = performance.now();
        if (!this._curr) this._curr = this.ip?.run(this._seed, this._steps);
        if (!this._curr) return;

        const checkBreakpoint = () => {
            // runInAction(() => {
                if (once) return false;

                const br = this.ip.current;
                if (!br) return false;
                if (br.n < 0 || br.n >= br.children.length) return false;

                if (
                    this.breakpoints.has(br) ||
                    this.breakpoints.has(br.children[br.n])
                ) {
                    this._paused = true;
                    return true;
                }
                return false;
            // });
        }

        let result = this._curr.next();
        let dt = this.lastLoop ? start - this.lastLoop : 0;
        this.ip.time += this.scaleTime(dt);
        const bp = checkBreakpoint();
        
        if (!bp && this._speed > 0) {
            for (let i = 0; i < this._speed; i++) {
                result = this._curr.next();
                if (checkBreakpoint()) break;
                // Cap per frame execution to 20ms/50fps
                // if (performance.now() - start > 20) break;
                dt = performance.now() - start;
                this.ip.time += this.scaleTime(dt);
                // Cap per frame execution to 20ms/50fps
                if (dt > 20) break;
            }
        }

        this.curr_node_index = this.nodes.findIndex(({ state }) => {
            const br = this.ip.current;
            if (!br) return false;
            if (br.n < 0 || br.n >= br.children.length)
                return state.source === br;
            return state.source === br.children[br.n];
        });

        for (const { state } of this.nodes) state.sync();

        const end = performance.now();
        this._timer += end - start;
        this.lastLoop = end;

        if (result.done) {
            this._curr = null;

            const [state, chars, FX, FY, FZ] = this.ip.state();

            this.ip.onRender();
            this.renderer.setCharacters(chars);
            this.renderer.update(FX, FY, FZ);
            this.renderer.render(state);
            this.renderer.done();
            this.rendered++;

            if (FZ > 1) {
                const palette = this.renderer.palette;
                const colors = chars.split("").map((c) => palette.get(c));

                this.output = {
                    name: `${this.name}_${this._seed}.vox`,
                    buffer: VoxHelper.serialize(state, FX, FY, FZ, colors),
                };
            }

            console.log(`Time: ${this._timer.toFixed(2)}ms`);
            console.log(`Steps: ${this.ip.counter} ${state.length}`);
            this.rendered = 0
        } else {
            if (!once)
                this._delay
                    ? setTimeout(
                        //   () => runInAction(() => this.loop()),
                          () => {
                            // console.log('loooping.timeout')
                            this.loop()
                        },
                          this._delay
                      )
                    : requestAnimationFrame(() => {
                        //   runInAction(() => this.loop())
                        // console.log('loooping.animation-requested')
                          this.loop()
                    }
                      );

            if (render) {
                const [state, chars, FX, FY, FZ] = result.value;

                this.ip.onRender();
                this.renderer.setCharacters(chars);
                this.renderer.update(FX, FY, FZ);
                this.renderer.render(state);
                this.rendered++;
            }
        }
    }

    //* @computed
    public get MX() {
        return this.DIM[0];
    }

    //* @computed
    public get MY() {
        return this.DIM[1];
    }

    //* @computed
    public get MZ() {
        return this.DIM[2];
    }

    //* @computed
    public get renderType() {
        const r = this.renderer;

        if (r instanceof BitmapRenderer) return "bitmap";
        if (r instanceof IsometricRenderer) return "isometric";
        if (r instanceof VoxelPathTracer) return "voxel";

        return null;
    }

    //* @action
    public toggleBreakpoint(index: number) {
        const node = this.nodes[index];
        if (!node) return;
        node.breakpoint = !node.breakpoint;

        if (node.breakpoint) {
            this.breakpoints.add(node.state.source);
        } else {
            this.breakpoints.delete(node.state.source);
        }
    }

    //* @action
    public toggleRender(type: "isometric" | "voxel") {
        const palette = this.renderer.palette;

        const oldCanvas = this.renderer.canvas;
        this.renderer.dispose();
        this.rendered = 0;

        this.renderer = new Render3DTypes[type]();
        this.renderer.palette = palette;
        this.renderer.clear();

        oldCanvas.replaceWith(this.renderer.canvas);
        this.renderer.canvas.id = oldCanvas.id;

        if (!this.ip) return;

        const [state, chars, FX, FY, FZ] = this.ip.state();

        this.ip.onRender();
        this.renderer.setCharacters(chars);
        this.renderer.update(FX, FY, FZ);
        this.renderer.render(state);
        this.rendered++;
    }

    //* @action
    public stop() {
        this.pause();
        this._curr = null;
        this.renderer.dispose();
    }
}
