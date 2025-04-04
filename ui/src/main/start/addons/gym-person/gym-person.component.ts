import { Component, OnInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VirtualCharacterComponent, ClickPosition } from './virtual-character/virtual-character.component';
import { MarkerService } from './services/marker.service';
import { Marker } from './models/marker.model';
import { EsService } from './services/es.service';

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

  markers: Marker[] = [];
  searchResults: any[] = [];
  loading = false;

  private currentPage = 1;
  private pageSize = 12;
  private hasMore = true;
  private currentSearchTerm = '';

  previewImageUrl: string | null = null;
  currentImageIndex: number = 0;

  availableTags: string[] = ['标签1', '标签2', '标签3']; // 示例标签

  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;  // 最小滑动距离

  private lastWheelTime: number = 0;
  private wheelThrottleTime: number = 500; // 节流时间（毫秒）

  translateX: number = 0;
  private containerWidth: number = 0;
  private loadedImages: Set<number> = new Set();

  constructor(
    private markerService: MarkerService,
    private esService: EsService
  ) { }

  ngOnInit() {
    this.initScene();
    this.setupInfiniteScroll();
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
        if (this.virtualCharacter) {
          // 仅初始化一次标记
          this.virtualCharacter.initializeMarkers(markers);
        }
      },
      error: (error) => {
        console.error('加载标记失败:', error);
      }
    });
  }

  onModelLoaded(loaded: boolean) {
    if (loaded) {
      this.loadMarkers();
    }
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

  onMarkerAdded(markerData: any): void {
    // 检查是否存在完全相同的标记（位置和标签都相同）
    const isDuplicate = this.markers.some(existingMarker =>
      existingMarker.label === markerData.label &&
      Math.abs(existingMarker.positionX - markerData.position.x) < 0.001 &&
      Math.abs(existingMarker.positionY - markerData.position.y) < 0.001 &&
      Math.abs(existingMarker.positionZ - markerData.position.z) < 0.001
    );

    if (isDuplicate) {
      alert('该位置已存在相同的标记！');
      if (this.virtualCharacter) {
        this.virtualCharacter.removeMarker(markerData.id);
      }
      return;
    }

    const newMarker = {
      label: markerData.label,
      positionX: markerData.position.x,
      positionY: markerData.position.y,
      positionZ: markerData.position.z,
      description: markerData.description || ''
    };
    console.log('新标记:', newMarker);

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

  onMarkerClicked(label: string) {
    this.currentPage = 1;
    this.hasMore = true;
    this.currentSearchTerm = label;
    this.searchResults = [];

    const query = {
      should: [
        { match: { "tags": label } }
      ]
    };

    this.esService.searchEntity(this.currentPage, this.pageSize, { bool: query }).subscribe({
      next: (response) => {
        if (response && response.list) {
          this.searchResults = response.list.flatMap((hit: any) => 
            hit._source.images.map((image: string) => ({
              id: hit._id,
              label: hit._source.labels.zh.value,
              tags: hit._source.tags,
              description: hit._source.descriptions.zh.value,
              imageUrl: `http://localhost:9000/kgms/${image}`
            }))
          );
          console.log('搜索结果:', this.searchResults);
          this.hasMore = this.searchResults.length === this.pageSize;
        }
      },
      error: (error) => {
        console.error('搜索失败:', error);
      }
    });
  }

  private setupInfiniteScroll() {
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
      gallerySection.addEventListener('scroll', () => {
        if (this.loading || !this.hasMore) return;
        
        const { scrollTop, scrollHeight, clientHeight } = gallerySection;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
          this.loadMoreResults();
        }
      });
    }
  }

  private loadMoreResults() {
    if (!this.searchResults.length) return;
    
    this.loading = true;
    this.currentPage++;

    const query = {
      should: [
        { match: { "tags": this.currentSearchTerm } }
      ]
    };

    this.esService.searchEntity(this.currentPage, this.pageSize, { bool: query }).subscribe({
      next: (response) => {
        if (response && response.list) {
          const newResults = response.list.flatMap((hit: any) => 
            hit._source.images.map((image: string) => ({
              id: hit._id,
              label: hit._source.labels.zh.value,
              tags: hit._source.tags,
              description: hit._source.descriptions.zh.value,
              imageUrl: `http://localhost:9000/kgms/${image}`
            }))
          );

          console.log('新结果:', newResults);
          
          this.searchResults = [...this.searchResults, ...newResults];
          this.hasMore = newResults.length === this.pageSize;
        } else {
          this.hasMore = false;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载更多失败:', error);
        this.loading = false;
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

  previewImage(url: string) {
    if (!url) return;
    this.previewImageUrl = url;
    this.currentImageIndex = this.searchResults.findIndex(result => result.imageUrl === url);
    this.updateTranslateX();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  closePreview() {
    this.previewImageUrl = null;
    document.body.style.overflow = 'auto';
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('wheel', this.handleWheel);
  }

  showPreviousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateTranslateX();
    }
  }

  showNextImage() {
    if (this.currentImageIndex < this.searchResults.length - 1) {
      this.currentImageIndex++;
      this.updateTranslateX();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      this.showPreviousImage();
    } else if (event.key === 'ArrowRight') {
      this.showNextImage();
    } else if (event.key === 'Escape') {
      this.closePreview();
    }
  }

  public handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const currentTime = Date.now();
    
    // 节流处理，防止触控板滑动太灵敏
    if (currentTime - this.lastWheelTime < this.wheelThrottleTime) {
      return;
    }

    // deltaX > 0 表示向左滑动，显示下一张
    // deltaX < 0 表示向右滑动，显示上一张
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      if (event.deltaX > 30) {
        this.showNextImage();
      } else if (event.deltaX < -30) {
        this.showPreviousImage();
      }
    }

    this.lastWheelTime = currentTime;
  }

  handleTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  handleTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (Math.abs(swipeDistance) >= this.minSwipeDistance) {
      if (swipeDistance > 0) {
        this.showPreviousImage();
      } else {
        this.showNextImage();
      }
    }
  }

  filterByTag(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const tag = selectElement.value;
    if (tag) {
      this.searchResults = this.searchResults.filter(result => result.tags.includes(tag));
    } else {
      this.loadMarkers(); // 重新加载所有标记
    }
  }

  private updateTranslateX() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      this.containerWidth = modalContent.clientWidth;
      this.translateX = -this.currentImageIndex * this.containerWidth;
    }
  }

  onImageLoad(index: number) {
    this.loadedImages.add(index);
    // 当前图片加载完成后更新位置
    if (index === this.currentImageIndex) {
      this.updateTranslateX();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.previewImageUrl) {
      this.updateTranslateX();
    }
  }

  ngOnDestroy() {
    this.renderer?.dispose();
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('wheel', this.handleWheel);
  }
}
