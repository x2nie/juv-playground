import { Renderer } from "..";
import { BoolArray, BoolArray2D } from "../../helpers/datastructures";
import * as THREE from 'three';
// import 'three/examples/js/controls/TrackballControls';
import { Detector } from "./Detector";
import { GreedyMesh } from "./meshers/greedy";
import { createTestData } from "./testdata";
import { MonotoneMesh } from "./meshers/monotone";

export class ThreeRenderer extends Renderer {
    public static readonly BLOCK_SIZE = 6;
    private static _canvas = document.createElement("canvas");
    // private static _ctx = IsometricRenderer._canvas.getContext("2d");

    public override get canvas(): HTMLCanvasElement {
        return ThreeRenderer._canvas;
    }



    private MX: number;
    private MY: number;
    private MZ: number;

    // private visible: BoolArray;
    // private hash: BoolArray2D;

    // private sprite: VoxelSprite;
    // private img: ImageData;
    private renderer: any;
    private scene: any;
    private camera: any;
    private cameraControls: any;
    private testdata: any;
    private surfacemesh: any;
    private wiremesh: any;
    private geometry: any;
    

    constructor() {
        let renderer,scene,camera,cameraControls;
        super();        
        this.canvas.style.imageRendering = "auto";
        this.canvas.style.objectFit = "contain";
        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                antialias: true,	// to get smoother output
                preserveDrawingBuffer: true	// to allow screenshot
            });
        } else {
            renderer = new THREE.CanvasRenderer();
        }
        // renderer.setClearColorHex(0xBBBBBB, 1);

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        // stats = new Stats();
        // stats.domElement.style.position = 'absolute';
        // stats.domElement.style.bottom = '0px';
        // document.body.appendChild(stats.domElement);

        // create a scene
        scene = new THREE.Scene();

        // put a camera in the scene
        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(0, 0, 40);
        scene.add(camera);

        // create a camera contol
    //    cameraControls = new THREE.TrackballControls(camera, document.getElementById('container'))

        /*
        // transparently support window resize
        THREEx.WindowResize.bind(renderer, camera);
        // allow 'p' to make screenshot
        THREEx.Screenshot.bindKey(renderer);
        // allow 'f' to go fullscreen where this feature is supported
        if (THREEx.FullScreen.available()) {
            THREEx.FullScreen.bindKey();
            document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
        }
        */


        //Initialize dom elements
        this.testdata = createTestData();
        // var ds = document.getElementById("datasource");
        // for (var id in testdata) {
        //     ds.add(new Option(id, id), null);
        // }
        // ds.onchange = updateMesh;
        // var ms = document.getElementById("mesher");
        // for (var alg in meshers) {
        //     ms.add(new Option(alg, alg), null);
        // }
        // ms.onchange = updateMesh;

        // document.getElementById("showfacets").checked = true;
        // document.getElementById("showedges").checked = true;
        Object.assign(this, {}, {renderer,scene,camera,cameraControls})

        //Update mesh
        this.updateMesh();
    }


    updateMesh() {
        const {renderer,scene,camera,cameraControls} = this;
        let { surfacemesh, wiremesh} = this;
        
			scene.remove(surfacemesh);
			scene.remove(wiremesh);

			let geometry = this.geometry = new THREE.Geometry();
			var mesher = 
                MonotoneMesh 
                // GreedyMesh
				, data = this.testdata['16 Color Noise']
				, result = mesher(data.voxels, data.dims);
			// document.getElementById("vertcount").value = result.vertices.length;
			// document.getElementById("facecount").value = result.faces.length;
			geometry.vertices.length = 0;
			geometry.faces.length = 0;
			for (var i = 0; i < result.vertices.length; ++i) {
				var q = result.vertices[i];
				geometry.vertices.push(new THREE.Vector3(q[0], q[1], q[2]));
			}
			for (var i = 0; i < result.faces.length; ++i) {
				var q = result.faces[i];
				if (q.length === 5) {
					var f = new THREE.Face4(q[0], q[1], q[2], q[3]);
					f.color = new THREE.Color(q[4]);
					f.vertexColors = [f.color, f.color, f.color, f.color];
					geometry.faces.push(f);
				} else if (q.length == 4) {
					var f = new THREE.Face3(q[0], q[1], q[2]);
					f.color = new THREE.Color(q[3]);
					f.vertexColors = [f.color, f.color, f.color];
					geometry.faces.push(f);
				}
			}

			geometry.computeFaceNormals();

			geometry.verticesNeedUpdate = true;
			geometry.elementsNeedUpdate = true;
			geometry.normalsNeedUpdate = true;

			geometry.computeBoundingBox();
			geometry.computeBoundingSphere();

			var bb = geometry.boundingBox;


			//Create surface mesh
			var material = new THREE.MeshBasicMaterial({
				vertexColors: true
			});
			surfacemesh = this.surfacemesh = new THREE.Mesh(geometry, material);
			surfacemesh.doubleSided = false;
			var wirematerial = new THREE.MeshBasicMaterial({
				color: 0xffffff
				, wireframe: true
			});
			wiremesh = this.wiremesh = new THREE.Mesh(geometry, wirematerial);
			wiremesh.doubleSided = true;

			wiremesh.position.x = surfacemesh.position.x = -(bb.max.x + bb.min.x) / 2.0;
			wiremesh.position.y = surfacemesh.position.y = -(bb.max.y + bb.min.y) / 2.0;
			wiremesh.position.z = surfacemesh.position.z = -(bb.max.z + bb.min.z) / 2.0;

			scene.add(surfacemesh);
			scene.add(wiremesh);
            // Object.assign(this, {}, {geometry,wiremesh, surfacemesh})
        console.log(renderer.info)
    }

    override update(MX: number, MY: number, MZ: number) {
        if (this.MX === MX && this.MY === MY && this.MZ === MZ) return;
        console.log(`x:${this.MX} y:${this.MY} z:${this.MZ}`);

        this.MX = MX;
        this.MY = MY;
        this.MZ = MZ;
        // this.visible = new BoolArray(MX * MY * MZ);
        // this.hash = new BoolArray2D(MX + MY + 2 * MZ - 3, MX + MY - 1);

        // const FITWIDTH = (MX + MY) * this.sprite.size,
        //     FITHEIGHT = ~~(((MX + MY) / 2 + MZ) * this.sprite.size);

        // const W = FITWIDTH + 2 * this.sprite.size;
        // const H = FITHEIGHT + 2 * this.sprite.size;

        // this.img = new ImageData(W, H);
    }

    override _render(state: Uint8Array) {
        // const { MX, MY, MZ, visible, hash, ctx, sprite, colors, img } = this;

        // if (!ctx || !sprite || !colors || !img) return;
        // this.updateMesh()

        const { surfacemesh, wiremesh, renderer} = this;
        surfacemesh.visible = true;
        // wiremesh.visible = false;
        wiremesh.visible = true;
        renderer.render(this.scene, this.camera)

        
    }

    override clear() {
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    override dispose() {}
}

// Brightness on 3 sides of the cube
const C1 = 215;
const C2 = 143;
const C3 = 71;

const transparent = 0xff;
const black = 0;

