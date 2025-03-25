import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VirtualCharacterComponent, ClickPosition } from './virtual-character/virtual-character.component';
import { MarkerService } from './services/marker.service';
import { Marker } from './models/marker.model';

@Component({
  selector: 'app-gym-person',
  templateUrl: './gym-person.component.html',
  styleUrls: ['./gym-person.component.scss']
})
export class GymPersonComponent implements OnInit, OnDestroy {
  @ViewChild('virtualCharacter') virtualCharacter!: VirtualCharacterComponent;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  images = [
    { id: 1, url: 'assets/images/gym/pose1.jpg', title: '标准姿势 1' },
    { id: 2, url: 'assets/images/gym/pose2.jpg', title: '标准姿势 2' },
    { id: 3, url: 'assets/images/gym/pose3.jpg', title: '标准姿势 3' },
  ];

  isMarkerMode: boolean = false;
  markers: Marker[] = [];

  constructor(private markerService: MarkerService) {}

  ngOnInit() {
    this.initScene();
    this.loadMarkers();
  }

  ngAfterViewInit() {
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
  }

  private loadMarkers() {
    this.markerService.getMarkers().subscribe({
      next: (markers) => {
        this.markers = markers;
        markers.forEach(marker => {
          if (this.virtualCharacter) {
            const position = new THREE.Vector3(
              marker.positionX,
              marker.positionY,
              marker.positionZ
            );
            this.virtualCharacter.addMarker(position, marker.label);
          }
        });
      },
      error: (error) => {
        console.error('加载标记失败:', error);
      }
    });
  }

  onModelClicked(position: ClickPosition): void {
    console.log('模型被点击:', position);
    // 这里可以添加点击后的处理逻辑
    // 例如：显示该部位的详细信息
    const message = `点击位置：X: ${position.x.toFixed(2)}, Y: ${position.y.toFixed(2)}, Z: ${position.z.toFixed(2)}`;
    if (position.partName) {
      message + `\n部位: ${position.partName}`;
    }
    alert(message);
  }

  toggleMarkerMode(): void {
    this.isMarkerMode = !this.isMarkerMode;
    if (this.virtualCharacter) {
      this.virtualCharacter.toggleMarkerMode(this.isMarkerMode);
    }
  }

  onMarkerAdded(markerData: any): void {
    const newMarker = {
      label: markerData.label,
      positionX: markerData.position.x,
      positionY: markerData.position.y,
      positionZ: markerData.position.z,
      description: markerData.description || ''
    };

    this.markerService.createMarker(newMarker).subscribe({
      next: (savedMarker) => {
        this.markers.push(savedMarker);
        console.log('标记已保存:', savedMarker);
      },
      error: (error) => {
        console.error('保存标记失败:', error);
        // 移除已添加的3D标记
        if (this.virtualCharacter) {
          this.virtualCharacter.removeMarker(markerData.id);
        }
      }
    });
  }

  removeMarker(id: number): void {
    this.markerService.deleteMarker(id).subscribe({
      next: () => {
        this.markers = this.markers.filter(m => m.id !== id);
        if (this.virtualCharacter) {
          this.virtualCharacter.removeMarker(id.toString());
        }
      },
      error: (error) => {
        console.error('删除标记失败:', error);
      }
    });
  }

  ngOnDestroy() {
    this.renderer?.dispose();
  }
}
