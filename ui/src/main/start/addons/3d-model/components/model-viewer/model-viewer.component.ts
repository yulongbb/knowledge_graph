import { Component, ElementRef, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

@Component({
  selector: 'app-model-viewer',
  template: `
    <canvas #canvas></canvas>
    <div class="animation-controls" *ngIf="hasAnimations && showControls">
      <button (click)="toggleAnimation()" class="anim-btn">
        {{isPlaying ? '⏸️' : '▶️'}}
      </button>
      <span class="anim-info">{{currentAnimation}}</span>
      <select *ngIf="animations.length > 1" (change)="onAnimationChange($event)">
        <option *ngFor="let anim of animations" [value]="anim">{{anim}}</option>
      </select>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
    }
    .animation-controls {
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(0,0,0,0.5);
      padding: 5px;
      border-radius: 4px;
      color: white;
    }
    .anim-btn {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
    }
    .anim-btn:hover {
      background: rgba(255,255,255,0.2);
    }
    .anim-info {
      font-size: 12px;
      margin: 0 8px;
    }
  `]
})
export class ModelViewerComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() modelUrl!: string;
  @Input() showControls: boolean = false;
  @Output() modelLoaded = new EventEmitter<boolean>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mixer!: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  
  hasAnimations = false;
  isPlaying = true;
  animations: string[] = [];
  currentAnimation = '';
  private animationActions: Map<string, THREE.AnimationAction> = new Map();
  private currentAction: THREE.AnimationAction | null = null;

  ngOnInit() {
    this.initScene();
    this.loadModel();
    this.animate();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup - moved further back for better view
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.set(0, 0, 10); // Moved further away

    // Renderer setup with better rendering settings
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    
    // Improved lighting setup
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional lights from multiple angles
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 10);
    frontLight.castShadow = true;
    this.scene.add(frontLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 10, 0);
    this.scene.add(topLight);

    const leftLight = new THREE.DirectionalLight(0xffffff, 0.5);
    leftLight.position.set(-10, 0, 0);
    this.scene.add(leftLight);

    const rightLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rightLight.position.set(10, 0, 0);
    this.scene.add(rightLight);

    this.onResize();
    window.addEventListener('resize', () => this.onResize());
  }

  private loadModel() {
    console.log('Starting to load model from URL:', this.modelUrl);
    
    // Extract file extension more robustly
    const url = new URL(this.modelUrl);
    const pathname = url.pathname;
    const fileExtension = pathname.split('.').pop()?.toLowerCase();
    
    console.log('Detected file extension:', fileExtension);

    if (fileExtension === 'glb' || fileExtension === 'gltf') {
        const loader = new GLTFLoader();
        console.log('Using GLTFLoader for', fileExtension, 'file');

        loader.load(
            this.modelUrl,
            (result) => {
                const model = result.scene || result;
                this.addModelToScene(model);
                console.log('GLTF model loaded successfully');
                
                // Handle animations for GLTF models
                if (result.animations && result.animations.length > 0) {
                    this.setupAnimations(result.animations, model);
                }
                
                this.modelLoaded.emit(true);
            },
            (progress) => {
                console.log('Loading progress:', Math.round(progress.loaded / progress.total * 100), '%');
            },
            (error) => {
                console.error('Error loading GLTF model:', error);
                this.modelLoaded.emit(false);
            }
        );
    } else if (fileExtension === 'fbx') {
        const loader = new FBXLoader();
        console.log('Using FBXLoader for FBX file');

        loader.load(
            this.modelUrl,
            (model) => {
                this.addModelToScene(model);
                console.log('FBX model loaded successfully');
                
                // Handle animations for FBX models
                if (model.animations && model.animations.length > 0) {
                    this.setupAnimations(model.animations, model);
                }
                
                this.modelLoaded.emit(true);
            },
            (progress) => {
                if (progress.lengthComputable) {
                    console.log('Loading progress:', Math.round(progress.loaded / progress.total * 100), '%');
                }
            },
            (error) => {
                console.error('Error loading FBX model:', error);
                this.modelLoaded.emit(false);
            }
        );
    } else {
        console.error('Unsupported file format or unable to detect format:', fileExtension);
        this.modelLoaded.emit(false);
    }
  }

  private setupAnimations(animations: THREE.AnimationClip[], model: THREE.Object3D) {
    if (animations.length > 0) {
        console.log(`Found ${animations.length} animations in model`);
        this.hasAnimations = true;
        this.mixer = new THREE.AnimationMixer(model);
        
        animations.forEach((clip) => {
            const name = clip.name || `Animation ${this.animations.length + 1}`;
            this.animations.push(name);
            const action = this.mixer.clipAction(clip);
            this.animationActions.set(name, action);
        });
        
        // Start playing the first animation
        if (this.animations.length > 0) {
            this.currentAnimation = this.animations[0];
            this.currentAction = this.animationActions.get(this.currentAnimation)!;
            this.currentAction.play();
        }
    }
  }

  toggleAnimation() {
    if (!this.currentAction) return;
    
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
        this.currentAction.paused = false;
    } else {
        this.currentAction.paused = true;
    }
  }
  
  changeAnimation(animationName: string) {
    if (!this.animationActions.has(animationName)) return;
    
    // Fade out current animation
    if (this.currentAction) {
        const oldAction = this.currentAction;
        oldAction.fadeOut(0.5);
    }
    
    // Fade in new animation
    this.currentAnimation = animationName;
    this.currentAction = this.animationActions.get(animationName)!;
    this.currentAction.reset();
    this.currentAction.fadeIn(0.5);
    this.currentAction.play();
    this.isPlaying = true;
  }

  onAnimationChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement && selectElement.value) {
      this.changeAnimation(selectElement.value);
    }
  }

  private addModelToScene(model: THREE.Object3D) {
    this.scene.clear();
    
    // Re-add the lights after clearing the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 10);
    this.scene.add(frontLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 10, 0);
    this.scene.add(topLight);

    const leftLight = new THREE.DirectionalLight(0xffffff, 0.5);
    leftLight.position.set(-10, 0, 0);
    this.scene.add(leftLight);

    const rightLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rightLight.position.set(10, 0, 0);
    this.scene.add(rightLight);

    this.scene.add(model);

    // Center and scale model with more conservative scaling
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // More conservative scale factor (50 instead of 100) to prevent overflow
    const scale = 50 / maxDim;
    
    model.scale.setScalar(scale);
    
    // Adjust the model's position to ensure it stays within boundaries
    model.position.set(
      -center.x * scale,      // Center horizontally
      -center.y * scale,      // Center vertically without additional offset
      -center.z * scale       // Center depth-wise
    );

    // Enhanced material handling for FBX models to prevent black silhouettes
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        // Check if the material needs updating
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.side = THREE.DoubleSide; // Render both sides
              mat.needsUpdate = true;
            });
          } else {
            child.material.side = THREE.DoubleSide; // Render both sides
            child.material.needsUpdate = true;
          }
        }
      }
    });

    // Set the camera to properly frame the model
    this.frameModel(model, box);
  }

  private frameModel(model: THREE.Object3D, box: THREE.Box3) {
    // Calculate proper camera position to frame the model
    const center = new THREE.Vector3();
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Use more conservative camera positioning
    cameraZ *= 0.7;
    
    // Position camera to view model from slight angle
    this.camera.position.set(0, 0, cameraZ);
    
    // Ensure the controls target is centered on the model
    this.controls.target.copy(center);
    this.controls.update();
    
    // Adjust camera near and far clipping planes to prevent model cutoff
    this.camera.near = 0.01;
    this.camera.far = cameraZ * 4;
    
    // Set a narrower field of view
    this.camera.fov = 40; // Narrower FOV for better focus
    this.camera.updateProjectionMatrix();
    
    // Restrict orbit controls to prevent moving beyond container
    this.controls.minDistance = cameraZ * 0.5;
    this.controls.maxDistance = cameraZ * 1.2;
    
    // Limit vertical orbit to prevent seeing outside the container
    this.controls.maxPolarAngle = Math.PI * 0.7;
    this.controls.minPolarAngle = Math.PI * 0.3;
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update animation mixer on each frame
    if (this.mixer) {
        const delta = this.clock.getDelta();
        this.mixer.update(delta);
    }
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (width === 0 || height === 0) {
      // Don't update with zero dimensions
      return;
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    
    // Force renderer to fill the space
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
}
