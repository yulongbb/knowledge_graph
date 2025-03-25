import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface ClickPosition {
  x: number;
  y: number;
  z: number;
  partName?: string;
}

@Component({
  selector: 'app-virtual-character',
  template: `
    <div class="canvas-container">
      <canvas #canvas></canvas>
      <div *ngIf="loadingStatus" class="loading-status">
        {{ loadingStatus }}
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    canvas { 
      width: 100% !important; 
      height: 100% !important;
      display: block;
    }
    .loading-status {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #333;
    }
  `]
})
export class VirtualCharacterComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvas') private canvasRef!: ElementRef;
  @Input() isAnimating: boolean = false;  // 添加输入属性控制动画
  @Input() isAnswering: boolean = false;  // 改为控制回答状态
  @Output() modelClicked = new EventEmitter<ClickPosition>();
  public loadingStatus: string = ''; // Changed to public
  @Output() markerAdded = new EventEmitter<any>();

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId: number = 0;
  private mixer: THREE.AnimationMixer | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  private modelPath = '/assets/models/men.fbx'; // 确保这个路径是正确的
  private actions: THREE.AnimationAction[] = [];  // 存储所有动画action
  private currentAction: THREE.AnimationAction | null = null;  // 当前播放的动画
  private defaultAnimationPlaying: boolean = true;  // 添加默认动画状态控制
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private clickMarker: THREE.Mesh | null = null;
  private controls!: OrbitControls;
  private markers: Map<string, THREE.Sprite> = new Map();
  private isAddingMarker: boolean = false;

  constructor() {
    this.handleResize = this.handleResize.bind(this);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);
    window.addEventListener('resize', this.handleResize);
  }

  ngAfterViewInit(): void {
    this.setupScene();
    this.setupControls();
    this.loadModel();
    this.animate();
    this.setupClickDetection();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }

  ngOnChanges(changes: any): void {
    console.log('Animation state changed:', changes);
    if (changes.isAnswering) {
      console.log('isAnswering changed to:', changes.isAnswering.currentValue);
      if (changes.isAnswering.currentValue) {
        this.playAnimation();
      } else if (!this.defaultAnimationPlaying) {
        this.stopAnimation();
      }
    }
  }

  private handleResize(): void {
    if (this.canvasRef && this.camera && this.renderer) {
      const canvas = this.canvasRef.nativeElement;
      const container = canvas.parentElement;
      
      // 设置渲染器大小为容器大小
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      
      // 更新相机宽高比
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  private setupScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    
    // Setup renderer with basic settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      context: canvas.getContext('webgl2') || canvas.getContext('webgl')
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // 调整相机参数以更好地显示模型
    this.camera = new THREE.PerspectiveCamera(
      35,  // 减小视角
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    
    // 调整相机位置，让模型更居中
    this.camera.position.set(0, 150, 500);
    this.camera.lookAt(0, 150, 0);

    // 优化灯光设置
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // 增加环境光强度
    this.scene.add(ambientLight);

    // 添加正面主光源并启用阴影
    const frontLight = new THREE.DirectionalLight(0xffffff, 4);
    frontLight.position.set(0, 3, 4);
    frontLight.castShadow = true;
    frontLight.shadow.bias = -0.001;
    frontLight.shadow.mapSize.width = 2048;
    frontLight.shadow.mapSize.height = 2048;
    this.scene.add(frontLight);

    // 添加补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
    fillLight.position.set(-3, 3, 2);
    this.scene.add(fillLight);

    // 添加背光
    const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
    backLight.position.set(0, 2, -3);
    this.scene.add(backLight);
  }

  private setupControls(): void {
    if (!this.camera || !this.renderer) {
      console.error('Camera or renderer not initialized');
      return;
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // 配置控制器
    this.controls.enableDamping = true; // 添加阻尼效果，使旋转更平滑
    this.controls.dampingFactor = 0.05;
    
    // 限制垂直旋转角度
    this.controls.minPolarAngle = Math.PI / 4; // 最小垂直角度
    this.controls.maxPolarAngle = Math.PI / 1.5; // 最大垂直角度
    
    // 限制缩放范围
    this.controls.minDistance = 200; // 最小距离
    this.controls.maxDistance = 1000; // 最大距离
    
    // 禁用平移
    this.controls.enablePan = false;
    
    // 设置旋转速度
    this.controls.rotateSpeed = 0.5;
  }

  private loadModel(): void {
    const loader = new FBXLoader();
    this.loadingStatus = '加载模型中...';
    
    loader.load(
      this.modelPath,
      (fbx) => {
        this.loadingStatus = '';
        
        // 计算模型尺寸
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // 调整模型位置和缩放
        const scale = 1.5;
        fbx.scale.setScalar(scale);
        
        // 将模型放置在中心位置，稍微抬高，并调整旋转
        fbx.position.set(0, size.y * scale * 0.1, 0);
        fbx.rotation.set(0, 0, 0); // 修改这里：设置为(0, 0, 0)使模型面向摄像机

        this.scene.add(fbx);
        
        // 优化动画设置
        if (fbx.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(fbx);
          console.log('Found animations:', fbx.animations.length);
          
          fbx.animations.forEach((clip, index) => {
            if (this.mixer) {
              console.log('Setting up animation:', index);
              const action = this.mixer.clipAction(clip);
              action.setLoop(THREE.LoopRepeat, Infinity);
              this.actions.push(action);
              
              // 设置默认动画并立即播放
              if (!this.currentAction) {
                this.currentAction = action;
                action.play();
                this.defaultAnimationPlaying = true;  // 设置初始状态为播放
              }
            }
          });
        } else {
          console.warn('No animations found in model');
        }

        // 调整相机位置适应模型大小，并确保正面观察
        const modelHeight = size.y * scale;
        const cameraDistance = modelHeight * 2;
        this.camera.position.set(0, modelHeight * 0.7, cameraDistance);
        this.camera.lookAt(0, modelHeight * 0.7, 0);

        // 更新控制器的目标点
        if (this.controls) {
          this.controls.target.set(0, modelHeight * 0.5, 0);
          this.controls.update();
        }
      },
      (progress) => {
        // 加载进度
        const percentComplete = (progress.loaded / progress.total) * 100;
        this.loadingStatus = `加载中: ${Math.round(percentComplete)}%`;
      },
      (error) => {
        // 错误处理
        console.error('模型加载失败:', error);
        this.loadingStatus = '模型加载失败，请检查模型路径是否正确';
      }
    );
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    if (this.mixer && this.currentAction) {
      // 在回答问题或默认状态下播放动画
      this.mixer.update(delta);
    }
    
    // 更新控制器
    if (this.controls) {
      this.controls.update();
    }
    
    // 更新标记的朝向
    this.markers.forEach(sprite => {
      sprite.quaternion.copy(this.camera.quaternion);
    });

    this.renderer.render(this.scene, this.camera);
  }

  private setupClickDetection(): void {
    const canvas = this.canvasRef.nativeElement;
    
    canvas.addEventListener('click', (event: MouseEvent) => {
      if (this.isAddingMarker) {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
          const intersection = intersects[0];
          const label = prompt('请输入标记名称：');
          if (label) {
            const position = intersection.point;
            this.addMarker(position, label);
          }
        }
      } else {
        // 计算鼠标在画布中的标准化坐标
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        // 更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 获取场景中所有可点击的物体
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
          const intersection = intersects[0];
          const clickPosition: ClickPosition = {
            x: intersection.point.x,
            y: intersection.point.y,
            z: intersection.point.z,
            partName: intersection.object.name || '未命名部位'
          };

          // 创建或移动点击标记
          this.showClickMarker(intersection.point);

          // 发出点击事件
          this.modelClicked.emit(clickPosition);
          
          console.log('点击位置:', clickPosition);
          console.log('点击物体名称:', intersection.object.name);
        }
      }
    });
  }

  private showClickMarker(position: THREE.Vector3): void {
    if (!this.clickMarker) {
      // 创建一个小球体作为点击标记
      const geometry = new THREE.SphereGeometry(2, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.clickMarker = new THREE.Mesh(geometry, material);
      this.scene.add(this.clickMarker);
    }

    // 更新标记位置
    this.clickMarker.position.copy(position);
    
    // 3秒后自动移除标记
    setTimeout(() => {
      if (this.clickMarker) {
        this.scene.remove(this.clickMarker);
        this.clickMarker = null;
      }
    }, 3000);
  }

  private createMarkerSprite(position: THREE.Vector3, label: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.beginPath();
    context.arc(128, 128, 45, 0, Math.PI * 2);
    context.fill();
    
    context.fillStyle = '#ff0000';
    context.strokeStyle = '#ffffff';
    context.lineWidth = 3;
    
    // 绘制标记点
    context.beginPath();
    context.arc(128, 128, 40, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // 添加文本标签
    context.font = 'bold 32px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(20, 20, 1);
    
    return sprite;
  }

  addMarker(position: THREE.Vector3, label: string): void {
    const id = `marker-${Date.now()}`;
    const sprite = this.createMarkerSprite(position, label);
    this.scene.add(sprite);
    this.markers.set(id, sprite);

    const markerData = {
      id,
      position: { x: position.x, y: position.y, z: position.z },
      label
    };

    this.markerAdded.emit(markerData);
  }

  removeMarker(id: string): void {
    const sprite = this.markers.get(id);
    if (sprite) {
      this.scene.remove(sprite);
      this.markers.delete(id);
    }
  }

  toggleMarkerMode(enable: boolean): void {
    this.isAddingMarker = enable;
    if (this.controls) {
      this.controls.enabled = !enable;
    }
  }

  // 改进动画控制方法
  public playAnimation(): void {
    console.log('Playing animation');
    this.isAnimating = true;
    if (this.currentAction) {
      this.currentAction.setEffectiveTimeScale(1);
      this.currentAction.play();
      this.currentAction.paused = false;
    }
  }

  public stopAnimation(): void {
    console.log('Stopping animation');
    this.isAnimating = false;
    if (this.currentAction) {
      this.currentAction.setEffectiveTimeScale(0);
      this.currentAction.paused = true;
    }
  }

  // 添加方法用于控制默认动画
  public pauseDefaultAnimation(): void {
    this.defaultAnimationPlaying = false;
    if (this.currentAction && !this.isAnswering) {
      this.currentAction.timeScale = 0;
      this.currentAction.paused = true;
    }
  }

  public resumeDefaultAnimation(): void {
    this.defaultAnimationPlaying = true;
    if (this.currentAction && !this.isAnswering) {
      this.currentAction.timeScale = 1;
      this.currentAction.paused = false;
    }
  }
}
