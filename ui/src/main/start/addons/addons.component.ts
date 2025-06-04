import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

interface Extension {
  id?: number;
  name: string;
  rating: number;
  description: string;
  reviews: number;
  category: string;
  image: string;
  url: string;
  isPinned: boolean; // Add this property
  screenshots: string[]; // Add this property to store multiple screenshots
  userRatings?: number[]; // 添加用户评分数组
  totalRatings: number;  // 添加总评分人数
}

@Component({
  selector: 'app-addons',
  templateUrl: './addons.component.html',
  styleUrls: ['./addons.component.scss']
})
export class AddonsComponent implements OnInit {
  categories: string[] = [];
  filteredExtensions: Extension[] = [];
  selectedExtension: Extension | null = null;
  selectedCategory: string | null = null;
  newExtension: Extension = {
    name: '',
    rating: 0,
    description: '',
    reviews: 0,
    category: '',
    image: '',
    url: '',
    isPinned: false,
    screenshots: [], // Initialize the screenshots array
    totalRatings: 0,  // 初始化总评分人数
    userRatings: []   // 初始化用户评分数组
  };
  isCreating: boolean = false;
  isEditing: boolean = false;
  pinnedExtensions: Extension[] = [];
  currentSlide: number = 0;
  currentScreenshot: number = 0;
  searchQuery: string = '';
  allExtensions: Extension[] = [];
  hoverRating: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchExtensions();
    this.fetchCategories();
    this.fetchPinnedExtensions();
  }

  fetchExtensions() {
    this.http.get<Extension[]>('/api/addons').subscribe(data => {
      this.allExtensions = data;
      this.filteredExtensions = data;
    });
  }

  fetchCategories() {
    this.http.get<string[]>('/api/addons/categories').subscribe(data => {
      this.categories = ['全部', ...data];
    });
  }

  fetchPinnedExtensions() {
    this.http.get<Extension[]>('/api/addons/pinned').subscribe(
      data => {
        console.log('Pinned Extensions:', data); // Log the response for debugging
        this.pinnedExtensions = data || []; // Ensure it defaults to an empty array if null
      },
      error => {
        console.error('Error fetching pinned extensions:', error); // Log any errors
      }
    );
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.selectedExtension = null; // Reset selected extension
    this.isCreating = false; // Ensure the create form is hidden
    this.isEditing = false; // Ensure the edit form is hidden
    this.onSearch(); // 使用搜索方法来过滤结果
  }

  viewDetails(extension: Extension) {
    // Ensure screenshots array exists
    if (!extension.screenshots) {
      extension.screenshots = [];
    }
    this.selectedExtension = extension;
    this.currentScreenshot = 0; // Reset screenshot index
  }

  goBack() {
    this.selectedExtension = null;
    this.isCreating = false;
    this.isEditing = false;
    this.selectedCategory = null;
    this.fetchExtensions();
  }

  startCreating() {
    this.isCreating = true;
    this.selectedExtension = null; // Reset selected extension
    this.isEditing = false; // Ensure editing mode is off
  }

  cancelCreating() {
    this.isCreating = false;
  }

  createExtension() {
    this.http.post<Extension>('/api/addons', this.newExtension).subscribe(() => {
      this.fetchExtensions();
      this.isCreating = false;
      this.newExtension = {
        name: '',
        rating: 0,
        description: '',
        reviews: 0,
        category: '',
        image: '',
        url: '',
        isPinned: false,
        screenshots: [], // Initialize the screenshots array
        totalRatings: 0,  // 初始化总评分人数
        userRatings: []   // 初始化用户评分数组
      };
    });
  }

  startEditing() {
    this.isEditing = true;
    this.isCreating = false; // 确保创建表单被隐藏
  }

  cancelEditing() {
    this.isEditing = false;
  }

  saveEdit() {
    if (this.selectedExtension && this.selectedExtension.id) {
      this.http.put<Extension>(`/api/addons/${this.selectedExtension.id}`, this.selectedExtension).subscribe(() => {
        this.fetchExtensions();
        this.isEditing = false;
        this.selectedExtension = null; // 返回列表视图
      });
    }
  }

  deleteExtension(extension: Extension) {
    if (extension.id) {
      this.http.delete(`/api/addons/${extension.id}`).subscribe(() => {
        this.fetchExtensions();
        this.selectedExtension = null;
      });
    }
  }

  // Navigate to the previous slide
  prevSlide() {
    if (this.pinnedExtensions.length > 0) {
      this.currentSlide = (this.currentSlide - 1 + this.pinnedExtensions.length) % this.pinnedExtensions.length;
    }
  }

  // Navigate to the next slide
  nextSlide() {
    if (this.pinnedExtensions.length > 0) {
      this.currentSlide = (this.currentSlide + 1) % this.pinnedExtensions.length;
    }
  }

  onScreenshotUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.http.post('/api/addons/upload-screenshot', formData, {
        reportProgress: true,
        observe: 'events',
      }).subscribe(event => {
        if (event.type === HttpEventType.Response) {
          const response: any = event.body;
          if (this.selectedExtension) {
            this.selectedExtension.image = response.url; // Update the screenshot URL
          }
        }
      });
    }
  }

  onScreenshotsUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const formData = new FormData();
      Array.from(input.files).forEach(file => {
        formData.append('files', file);
      });

      this.http.post<{urls: string[]}>('/api/addons/upload-screenshots', formData).subscribe(
        response => {
          if (this.isEditing && this.selectedExtension) {
            if (!this.selectedExtension.screenshots) {
              this.selectedExtension.screenshots = [];
            }
            this.selectedExtension.screenshots = [
              ...this.selectedExtension.screenshots,
              ...response.urls
            ];
            console.log('Updated screenshots:', this.selectedExtension.screenshots);
            this.selectedExtension = {...this.selectedExtension};
          } else if (this.isCreating) {
            this.newExtension.screenshots = [
              ...this.newExtension.screenshots,
              ...response.urls
            ];
          }
        },
        error => {
          console.error('Error uploading screenshots:', error);
        }
      );
    }
  }

  // Navigate to the previous screenshot
  prevScreenshot() {
    if (this.selectedExtension?.screenshots) {
      const maxIndex = Math.max(0, this.selectedExtension.screenshots.length - 2);
      this.currentScreenshot = Math.max(0, this.currentScreenshot - 2);
    }
  }

  // Navigate to the next screenshot
  nextScreenshot() {
    if (this.selectedExtension?.screenshots) {
      const maxIndex = Math.max(0, this.selectedExtension.screenshots.length - 2);
      this.currentScreenshot = Math.min(maxIndex, this.currentScreenshot + 2);
    }
  }

  getMainImage(extension: Extension): string {
    // 优先使用系统截图的第一张
    if (extension.screenshots && extension.screenshots.length > 0) {
      return 'http://localhost:4200/api/' + extension.screenshots[0];
    }
    // 如果没有系统截图则使用主图片
    return extension.image;
  }

  getShortDescription(description: string): string {
    // 移除所有HTML标签来计算实际文本长度
    const plainText = description.replace(/<[^>]*>/g, '');
    if (plainText.length <= 200) {
      return description;
    }
    
    // 查找最后一个完整单词的位置
    let truncated = description.substring(0, 100);
    let lastTagIndex = truncated.lastIndexOf('</');
    let lastSpaceIndex = truncated.lastIndexOf(' ');
    
    // 如果在截取范围内有未闭合的标签
    if (lastTagIndex > -1 && truncated.indexOf('>', lastTagIndex) === -1) {
      truncated = truncated.substring(0, lastTagIndex);
    }
    
    // 在最后一个完整单词处截断
    if (lastSpaceIndex > -1) {
      truncated = truncated.substring(0, lastSpaceIndex);
    }
    
    return truncated + '...';
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredExtensions = this.selectedCategory === '全部' ? 
        this.allExtensions : 
        this.allExtensions.filter(ext => ext.category === this.selectedCategory);
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredExtensions = this.allExtensions.filter(ext => {
      const matchesCategory = this.selectedCategory === '全部' || ext.category === this.selectedCategory;
      const matchesSearch = ext.name.toLowerCase().includes(query) || 
                          ext.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }

  get filteredCategories(): string[] {
    return this.categories.filter(category => category !== '全部');
  }

  rateAddon(addon: Extension, rating: number) {
    this.http.post<Extension>(`/api/addons/${addon.id}/rate`, { rating })
      .subscribe(updatedAddon => {
        this.selectedExtension = updatedAddon;
      });
  }

  visualize() {
    console.log('Visualize button clicked');
    // 在这里实现可视化逻辑
  }

  visualizeExtension(extension: Extension) {
    console.log('Visualizing extension:', extension.name);
    // 在这里实现具体的可视化逻辑
  }
}