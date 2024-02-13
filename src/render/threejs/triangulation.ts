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
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VoxelWorld } from "./voxelworld";


const cellSize = 40;



export class TriangulaionRenderer extends Renderer {
    public static readonly BLOCK_SIZE = 6;
    private static _canvas = document.createElement("canvas");
    private static _palcanvas = document.createElement("canvas");
    // private _canvas;// = document.createElement("canvas");
    // private static _ctx = IsometricRenderer._canvas.getContext("2d");

    public override get canvas(): HTMLCanvasElement {
        return TriangulaionRenderer._canvas;
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
    private directionalLight: any;
    private controls: any;
    private texture: any;
    // private world: VoxelWorld;
    

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
            // @ts-ignore
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
	// const texture = this.texture = loader.load( 'palette.png', ()=>{} );
	// texture.magFilter = THREE.NearestFilter;
	// texture.minFilter = THREE.NearestFilter;
	// texture.colorSpace = THREE.SRGBColorSpace;

    // this.world = new VoxelWorld( {
	// 	cellSize,
	// 	tileSize,
	// 	tileTextureWidth,
	// 	tileTextureHeight,
	// } );
        
        
        // put a camera in the scene
        const fov = 75;
        const aspect = 2; // the canvas default
        const near = 1;
        const far = 10000;
        // camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
        // camera.position.set(0, 0, 40);
        camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
        camera.position.set( - cellSize * .3, cellSize * .8, - cellSize * .3 );
        // camera.position.set( 0,0,0 );
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
        // scene.rotation.x = Math.PI / 2;
        // scene.rotation.z = Math.PI;
        // scene.add(camera);

        function addLight( x, y, z ) {

            const color = 0xFFFFFF;
            // const intensity = 3;
            const intensity = 1.7;
            const light = new THREE.DirectionalLight( color, intensity );
            // const light = new THREE.AmbientLight( color, intensity );
            // light.position.set( x, y, z );
            const u = 45
            light.position.set( x*u, y*u, z*u );
            scene.add( light );
    
        }
    
        addLight( -1, 4, 4 );
        addLight( 1, -1, -2 );
        // const amlight = new THREE.AmbientLight( 0xffffff, 2.5 );
        const amlight = new THREE.AmbientLight( 0xffffff, 2 );
        scene.add( amlight );
        const plight = new THREE.PointLight(0xffffff, 1000)
        plight.position.set(-70, 90, 80)
        scene.add(plight)
        // const light1 = new THREE.DirectionalLight( 0xffffff, 3 );
        // light1.position.set( 0, 200, 0 );
        // scene.add( light1 );

        // const light2 = new THREE.DirectionalLight( 0xffffff, 3 );
        // light2.position.set( 100, 200, 100 );
        // scene.add( light2 );

        // const light3 = new THREE.DirectionalLight( 0xffffff, 3 );
        // light3.position.set( - 100, - 200, - 100 );
        // scene.add( light3 );

        const sphereGeometry = new THREE.SphereGeometry(0.5)
        const material = new THREE.MeshStandardMaterial()
        const sphere = new THREE.Mesh(sphereGeometry, material)
        // sphere.position.x = 0
        scene.add(sphere)

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
        // this.updateMesh();
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


    

    public updateColors() {
        // debugger
        super.updateColors()
        // return
        const size = 8;
        const colors = this.colors
        // const len = this._chars.length;
        const len = colors.length >> 2;
        const canvas = TriangulaionRenderer._palcanvas;
        canvas.width = len * size
        canvas.height = 1 * size
        canvas.style.width = `${len * size}px`
        canvas.style.height = `${size}px`
        document.getElementById('pal').appendChild(canvas)
        // debugger
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = 'transparent'
        ctx.clearRect(0,0, canvas.width, canvas.height)
        // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // const data = imageData.data;
        // for (let i = 0; i < data.length; i ++) {
        //     // const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        //     // data[i] = avg; // red
        //     // data[i + 1] = avg; // green
        //     // data[i + 2] = avg; // blue
        //     data[i] = colors[i]
        // }
        // ctx.putImageData(imageData, 0, 0);
        for (let i = 0; i < len; i ++) {
            const c = i << 2;
            ctx.fillStyle= `rgba(${colors[c+0]}, ${colors[c+1]}, ${colors[c+2]}, ${colors[c+3]/255})`
            // ctx.fillStyle= `rgb(${colors[c+0]}, ${colors[c+1]}, ${colors[c+2]})`
            ctx.fillRect(i * size, 0, size, size)

        }

        // BYDAWPRFUENC
        const texture = this.texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        // this.world.tileTextureWidth = len * size
        // this.world.tileTextureHeight = 1 * size
        // this.world.tileSize = size
        // console.log('pAL:', this.palette)
        // console.log('chars:', this._chars)
        // console.log('cOLror:', this.colors)
        // console.log('clHex:', this.colorHex)
    }

    override update(MX: number, MY: number, MZ: number) {
        if (this.MX === MX && this.MY === MY && this.MZ === MZ) return;
        // console.log(`x:${this.MX} y:${this.MY} z:${this.MZ}`);

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
        state = this.juv2three(state)
        const {renderer,scene,camera,cameraControls, mesh} = this;
        scene.remove(mesh)
        /*for ( let z = 0; z < this.MZ; z++ ) {
            
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
                        this.world.setVoxel( x, y, z, value+1);
                        
                    }
                    else {
                        this.world.setVoxel( x, y, z, 0);
                    }
    
                }
    
            }
    
        }*/
        const colors = this.colors;
        const rgb = (i:number) => {
            const c = i << 2;
            return [colors[c+0]/255, colors[c+1]/255, colors[c+2]/255]
            return [colors[c+0], colors[c+1], colors[c+2]]
        }
        const rgba = (i:number) => {
            const c = i << 2;
            return [colors[c+0]/255, colors[c+1]/255, colors[c+2]/255, colors[c+3]/255]
            return [colors[c+0], colors[c+1], colors[c+2]]
        }
        // const result = MonotoneMesh(state, [this.MZ, this.MX, this.MY])
        // const result = GreedyMesh(state, [this.MZ, this.MX, this.MY])
        const result = GreedyMesh(state, [this.MY, this.MX, this.MZ])
        // const result = GreedyMesh(state, [this.MX, this.MY, this.MY])
        // console.log(result)
        // console.log('faces:', result.faces.length)
        // console.log('vertices:', result.vertices.length)
        // debugger
        
        const vertices = result.vertices
        const faces = result.faces
        const positions = []
        const indices = []
        const pcolors = []
        for (let i = 0; i < vertices.length; i++) {
            const q = vertices[i]
            // positions.push(q[0], q[1], q[2])
            // positions.push(q[0], q[2], q[3])
            positions.push(...q)
            // const [r,g,b] = rgb(q[3])
            // pcolors.push(r,g,b)
        }
        for (let i = 0; i < faces.length; i++) {
            const q = faces[i]
            indices.push(q[0], q[1], q[2])
            indices.push(q[0], q[2], q[3])
            // const [r,g,b] = rgb(q[4])
            // pcolors.push(r,g,b)
            // pcolors.push(r,g,b)
            // pcolors.push(r,g,b)
            
            // pcolors.push(r,g,b)
            // pcolors.push(r,g,b)
            // pcolors.push(r,g,b)
            const c = rgba(q[4])
            pcolors.push(...c)
            pcolors.push(...c)
            pcolors.push(...c)
            pcolors.push(...c)
        }
    
        // const { positions, normals, uvs, indices } = this.world.generateGeometryDataForCell( 0, 0, 0 );
        const geometry = new THREE.BufferGeometry();
        // const material = new THREE.MeshLambertMaterial( { color: 'green' } );
        // const material = new THREE.MeshLambertMaterial( { color: 'ivory' } );
        // const material = new THREE.MeshNormalMaterial (  );
        // const material = new THREE.MeshLambertMaterial( { vertexColors:true} );
        const material0 = new THREE.MeshLambertMaterial( {
            // map: this.texture,
            side: THREE.DoubleSide,
            vertexColors: true,
            // side: THREE.FrontSide,
            alphaTest: 0.1,
            transparent: true,
            // color: 0xffffff
        } );
        // var material0 = new THREE.MeshBasicMaterial ({
        //     // vertexColors: true, 
        //     color: 0xffffff
        //     , wireframe: true});
            
        const material = new THREE.MeshStandardMaterial ({
            // color: 0xffffff,
            // color: 0x049ef4,
            // emissive: 0,
            vertexColors: true,
            alphaTest: 0.1,
            transparent: true,
            // roughness:0.377,
            roughness:1,
            metalness:0.2,
            // visible:true,
        });
        // material.needsUpdate = true
    
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const colorNumComponents = 4;
        const uvNumComponents = 2;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute( new Float32Array( positions ), positionNumComponents ) );
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute( new Float32Array( pcolors ), colorNumComponents ) );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute( new Float32Array( result.normals ), normalNumComponents ) );
        
        geometry.setAttribute( 'uv', 
            new THREE.BufferAttribute( new Float32Array( result.uvs ), uvNumComponents ) );
    
        geometry.setIndex( indices );
        // geometry.translate(0, 0, this.MZ/2);
        // geometry.rotateX( Math.PI/2 )
        // geometry.rotateZ( Math.PI / 2)
        // geometry.rotateY( Math.PI / 2)
        // geometry.computeBoundingSphere();
        
        this.mesh = new THREE.Mesh( geometry, material );
        // this.mesh.rotation.x = Math.PI / 2;
        // this.mesh.rotation.z = Math.PI;
        // scene.rotation.x = Math.PI / 2;
        scene.add( this.mesh );

    }

    juv2three(state: Uint8Array){
        // const result = new Uint8Array(state.length)
        const res = []
        // Mendefinisikan ukuran array
        var X = this.MX;
        var Y = this.MY;
        var Z = this.MZ;
        // Mengisi array dengan rotasi indeks
        for (var z = 0; z < Y; z++) {
            for (var x = 0; x < X; x++) {
                for (var y = 0; y < Z; y++) {
                    // Memperhitungkan rotasi indeks
                    var index = z + y * Y + x * Y * Z;
                    res.push(state[index]); // Mengisi array dengan indeks yang dirotasi
                }
            }
        }
        // for ( let y = 0; y < this.MY; y++ ) {
            
        //     for ( let z = 0; z < this.MZ; z++ ) {
    
        //         for ( let x = 0; x < this.MX; x++ ) {
        //             //* const i = x + y * this.MX + z * this.MX * this.MY;
        //             // const i = y +   x * this.MX +      z * this.MX * this.MY;
        //             // const i = x + y * this.MX + z * this.MX * this.MY;
        //             const i = x + z * this.MX + y * this.MZ * this.MY;
    
        //             // const height = ( Math.sin( x / cellSize * Math.PI * 2 ) + Math.sin( z / cellSize * Math.PI * 3 ) ) * ( cellSize / 6 ) + ( cellSize / 2 );
        //             // const value = state[i];
        //             res.push(state[i])
    
        //         }
    
        //     }
    
        // }

        return new Uint8Array(res)
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

