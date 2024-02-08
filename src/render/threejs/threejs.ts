import { Renderer } from "..";
import { BoolArray, BoolArray2D } from "../../helpers/datastructures";
import * as THREE from 'three';

// import 'three/examples/js/controls/TrackballControls';
// import "three/examples/js/controls/OrbitControls.js";

import { Detector } from "./Detector";
import { GreedyMesh } from "./meshers/greedy";
import { createTestData } from "./testdata";
import { MonotoneMesh } from "./meshers/monotone";
// import { OrbitControls } from "./OrbitControls";
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VoxelWorld } from "./voxelworld";


const cellSize = 40;



export class ThreeRenderer extends Renderer {
    public static readonly BLOCK_SIZE = 6;
    private static _canvas = document.createElement("canvas");
    private static _palcanvas = document.createElement("canvas");
    // private _canvas;// = document.createElement("canvas");
    // private static _ctx = IsometricRenderer._canvas.getContext("2d");

    public override get canvas(): HTMLCanvasElement {
        return ThreeRenderer._canvas;
        // return this._canvas;
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
    private mesh: any;
    private camera: any;
    private cameraControls: any;
    private testdata: any;
    private surfacemesh: any;
    private wiremesh: any;
    private geometry: any;
    private controls: any;
    private world: VoxelWorld;
    

    constructor() {
        let renderer,scene,camera,cameraControls;
        super();        
        // this.canvas.style.imageRendering = "auto";
        // this.canvas.style.objectFit = "contain";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "450px";
        this.canvas.style.display = "block";
        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,	// to get smoother output
                // preserveDrawingBuffer: true	// to allow screenshot
            });
        } else {
            renderer = new THREE.CanvasRenderer();
        }
        // renderer.setClearColorHex(0xBBBBBB, 1);

        // renderer.setSize(window.innerWidth, window.innerHeight);
        // document.getElementById('container').appendChild(renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        // stats = new Stats();
        // stats.domElement.style.position = 'absolute';
        // stats.domElement.style.bottom = '0px';
        // document.body.appendChild(stats.domElement);

        // this.world = new VoxelWorld( cellSize );

        const tileSize = 16;
	const tileTextureWidth = 512;
	const tileTextureHeight = 8;
	const loader = new THREE.TextureLoader();
	// const texture = this.texture = loader.load( 'flourish-cc-by-nc-sa.png', ()=>{} );
	const texture = this.texture = loader.load( 'palette.png', ()=>{} );
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;

    this.world = new VoxelWorld( {
		cellSize,
		tileSize,
		tileTextureWidth,
		tileTextureHeight,
	} );
        
        
        // put a camera in the scene
        const fov = 75;
        const aspect = 2; // the canvas default
        const near = 0.1;
        const far = 1000;
        // camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
        // camera.position.set(0, 0, 40);
        camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
        camera.position.set( - cellSize * .3, cellSize * .8, - cellSize * .3 );
        // createControls() {
            const controls = this.controls = new OrbitControls(camera, this.canvas);
            controls.target.set( cellSize / 2, cellSize / 3, cellSize / 2 );
	        controls.update();
            // this.controls.autoRotate = true;
            // this.controls.enablePan = true;
            // this.controls.enableZoom = true;
            // this.controls.target.set(0, 0, 0);
        // }
        // create a scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 'lightblue' );
        // scene.add(camera);

        function addLight( x, y, z ) {

            const color = 0xFFFFFF;
            // const intensity = 3;
            const intensity = 1.47;
            const light = new THREE.DirectionalLight( color, intensity );
            // const light = new THREE.AmbientLight( color, intensity );
            // light.position.set( x, y, z );
            const u = 30
            light.position.set( x*u, y*u, z*u );
            scene.add( light );
    
        }
    
        addLight( -1, 1, 4 );
        addLight( 1, -1, -2 );

        // on mouse drag, animate!
        this.controls.addEventListener('change', ()=>{
            renderer.render(this.scene, this.camera)
        });

        // create a camera contol
        // cameraControls = new THREE.TrackballControls(camera, document.getElementById('container'))
    


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
        // this.testdata = createTestData();
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


        // Grid on the XZ plane
        const gx = 42;
        var gridXZ = new THREE.GridHelper(gx, gx, new THREE.Color(0xffffff), new THREE.Color(0x99999999));
        // gridXZ.geometry.rotateX( Math.PI / 2 );
        gridXZ.geometry.translate(gx/2 -1, -0.015, gx/2 -1);
        scene.add(gridXZ);

        // Global X,Y,Z axes
        var axes = new THREE.AxesHelper( gx* .65 );
        axes.geometry.translate(gx/2 -1, -0.02, gx/2 -1);
        scene.add(axes);
        
        //Update mesh
        this.updateMesh();
        // this.createLights()
    }

    createLights() {
        const intensity = 1;

        const skyColor = 0xB97A20;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        this.scene.add(hemisphereLight);

        const color = 0xFFFFFF;
        this.directionalLight = new THREE.DirectionalLight(color, intensity);
        this.directionalLight.position.set(10, 10, 10);
        this.directionalLight.target.position.set(0, 0, 0);
        this.scene.add(this.directionalLight);
    }


    updateMesh() {
        const {renderer,scene,camera,cameraControls} = this;
        for ( let y = 0; y < cellSize; ++ y ) {

            for ( let z = 0; z < cellSize; ++ z ) {
    
                for ( let x = 0; x < cellSize; ++ x ) {
    
                    const height = ( Math.sin( x / cellSize * Math.PI * 2 ) + Math.sin( z / cellSize * Math.PI * 3 ) ) * ( cellSize / 6 ) + ( cellSize / 2 );
                    if ( y < height ) {
    
                        // world.setVoxel( x, y, z, 1 );
                        this.world.setVoxel( x, y, z, y % 17 +7);
    
                    }
    
                }
    
            }
    
        }
    
        const { positions, normals, uvs, indices } = this.world.generateGeometryDataForCell( 0, 0, 0 );
        const geometry = new THREE.BufferGeometry();
        // const material = new THREE.MeshLambertMaterial( { color: 'green' } );
        // const material = new THREE.MeshLambertMaterial( { color: 'ivory' } );
        // const material = new THREE.MeshNormalMaterial (  );
        // const material = new THREE.MeshLambertMaterial( { vertexColors:true} );
        const material = new THREE.MeshLambertMaterial( {
            map: this.texture,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true,
        } );
    
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute( new Float32Array( positions ), positionNumComponents ) );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute( new Float32Array( normals ), normalNumComponents ) );
        
        geometry.setAttribute( 'uv', 
            new THREE.BufferAttribute( new Float32Array( uvs ), uvNumComponents ) );
    
        geometry.setIndex( indices );
        const mesh = this.mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

    }
    updateMesh0() {
        const {renderer,scene,camera,cameraControls} = this;
        let { surfacemesh, wiremesh} = this;
        
			scene.remove(surfacemesh);
			scene.remove(wiremesh);

			let geometry = this.geometry = new THREE.Geometry();
			var mesher = 
                MonotoneMesh 
                // GreedyMesh
				, data = this.testdata[
                    // '16 Color Noise'
                    // 'Boss'
                    "Matt's Example"
                ]
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

            const loader = new THREE.TextureLoader();
            // const texture = loader.load("assets/checker.png");
            const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/star.png' );
			// var material = new THREE.MeshBasicMaterial({
			// 	vertexColors: true
			// });
            // const material = new THREE.MeshPhongMaterial( { vertexColors:true,  map: texture  } );
            const material = new THREE.MeshLambertMaterial( { vertexColors:true,  map: texture  } );

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

    public updateColors() {
        super.updateColors()
        // return
        const size = 8;
        const len = this._chars.length;
        const canvas = ThreeRenderer._palcanvas;
        canvas.width = len * size
        canvas.height = 1 * size
        canvas.style.width = `${len * size}px`
        canvas.style.height = `${size}px`
        document.getElementById('pal').appendChild(canvas)
        // debugger
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colors = this.colors
        for (let i = 0; i < data.length; i ++) {
            // const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // data[i] = avg; // red
            // data[i + 1] = avg; // green
            // data[i + 2] = avg; // blue
            data[i] = colors[i]
        }
        ctx.putImageData(imageData, 0, 0);
        for (let i = 0; i < len; i ++) {
            const c = i * 4
            ctx.fillStyle= `rgba(${colors[c]}, ${colors[c+1]}, ${colors[c+2]}, ${colors[c+3]/255})`
            ctx.fillRect(i * size, 0, size, size)

        }

        // BYDAWPRFUENC
        const texture = this.texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.world.tileTextureWidth = len * size
        this.world.tileTextureHeight = 1 * size
        this.world.tileSize = size
    }

    override update(MX: number, MY: number, MZ: number) {
        if (this.MX === MX && this.MY === MY && this.MZ === MZ) return;
        console.log(`x:${this.MX} y:${this.MY} z:${this.MZ}`);

        this.MX = MX;
        this.MY = MY;
        this.MZ = MZ;
        console.log('pAL:', this.palette)
        console.log('chars:', this._chars)
        console.log('cOLror:', this.colors)
        // this.visible = new BoolArray(MX * MY * MZ);
        // this.hash = new BoolArray2D(MX + MY + 2 * MZ - 3, MX + MY - 1);

        // const FITWIDTH = (MX + MY) * this.sprite.size,
        //     FITHEIGHT = ~~(((MX + MY) / 2 + MZ) * this.sprite.size);

        // const W = FITWIDTH + 2 * this.sprite.size;
        // const H = FITHEIGHT + 2 * this.sprite.size;

        // this.img = new ImageData(W, H);
    }

    resizeRendererToDisplaySize(  ) {
        const {renderer} = this

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

    override _render(state: Uint8Array) {
        const {renderer,scene,camera,cameraControls} = this;
        // const { MX, MY, MZ, visible, hash, ctx, sprite, colors, img } = this;

        // if (!ctx || !sprite || !colors || !img) return;
        // this.updateMesh()
        this.updateMesh2(state)

        if ( this.resizeRendererToDisplaySize() ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}


        this.controls.update();
        // const { surfacemesh, wiremesh, renderer} = this;
        // surfacemesh.visible = true;
        // wiremesh.visible = false;
        // wiremesh.visible = true;
        
        // this.scene.mesh.rotation.y += .001;
        renderer.render(this.scene, this.camera)
    }

    
    updateMesh2(state: Uint8Array) {
        const {renderer,scene,camera,cameraControls, mesh} = this;
        scene.remove(mesh)
        for ( let z = 0; z < this.MZ; z++ ) {
            
            for ( let y = 0; y < this.MY; y++ ) {
    
                for ( let x = 0; x < this.MX; x++ ) {
                    //* const i = x + y * this.MX + z * this.MX * this.MY;
                    // const i = y +   x * this.MX +      z * this.MX * this.MY;
                    // const i = x + y * this.MX + z * this.MX * this.MY;
                    const i = x + z * this.MX + y * this.MX * this.MY;
    
                    // const height = ( Math.sin( x / cellSize * Math.PI * 2 ) + Math.sin( z / cellSize * Math.PI * 3 ) ) * ( cellSize / 6 ) + ( cellSize / 2 );
                    const value = state[i];
                    if (value !== 0) {
    
                    //     // world.setVoxel( x, y, z, 1 );
                        // this.world.setVoxel( x, y, z, value % 17 +1);
                        this.world.setVoxel( x, y, z, value);
                        
                    }
                    else {
                        this.world.setVoxel( x, y, z, 0);
                    }
    
                }
    
            }
    
        }
    
        const { positions, normals, uvs, indices } = this.world.generateGeometryDataForCell( 0, 0, 0 );
        const geometry = new THREE.BufferGeometry();
        // const material = new THREE.MeshLambertMaterial( { color: 'green' } );
        // const material = new THREE.MeshLambertMaterial( { color: 'ivory' } );
        // const material = new THREE.MeshNormalMaterial (  );
        // const material = new THREE.MeshLambertMaterial( { vertexColors:true} );
        const material = new THREE.MeshLambertMaterial( {
            map: this.texture,
            side: THREE.DoubleSide,
            // side: THREE.FrontSide,
            alphaTest: 0.1,
            transparent: true,
        } );
    
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute( new Float32Array( positions ), positionNumComponents ) );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute( new Float32Array( normals ), normalNumComponents ) );
        
        geometry.setAttribute( 'uv', 
            new THREE.BufferAttribute( new Float32Array( uvs ), uvNumComponents ) );
    
        geometry.setIndex( indices );
        // geometry.rotateX( Math.PI / 2)
        // geometry.rotateZ( Math.PI / 2)
        // geometry.rotateY( Math.PI / 2)
        this.mesh = new THREE.Mesh( geometry, material );
        scene.add( this.mesh );

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

