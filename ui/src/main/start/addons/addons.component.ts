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
    screenshots: [] // Initialize the screenshots array
  };
  isCreating: boolean = false;
  isEditing: boolean = false;
  pinnedExtensions: Extension[] = [];
  currentSlide: number = 0;
  currentScreenshot: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchExtensions();
    this.fetchCategories();
    this.fetchPinnedExtensions();
  }

  fetchExtensions() {
    this.http.get<Extension[]>('/api/addons').subscribe(data => {
      console.log(data);
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

    if (category === '全部') {
      this.fetchExtensions();
    } else {
      this.http.get<Extension[]>(`/api/addons?category=${category}`).subscribe(data => {
        this.filteredExtensions = data;
      });
    }
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
        screenshots: [] // Initialize the screenshots array
      };
    });
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
  }

  saveEdit() {
    if (this.selectedExtension && this.selectedExtension.id) {
      this.http.put<Extension>(`/api/addons/${this.selectedExtension.id}`, this.selectedExtension).subscribe(() => {
        this.fetchExtensions();
        this.isEditing = false;
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
    this.currentSlide = (this.currentSlide - 1 + this.pinnedExtensions.length) % this.pinnedExtensions.length;
  }

  // Navigate to the next slide
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.pinnedExtensions.length;
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
          if (this.selectedExtension) {
            // Initialize screenshots array if undefined
            if (!this.selectedExtension.screenshots) {
              this.selectedExtension.screenshots = [];
            }
            // Add new screenshots to existing ones
            this.selectedExtension.screenshots = [
              ...this.selectedExtension.screenshots,
              ...response.urls
            ];
            console.log('Updated screenshots:', this.selectedExtension.screenshots);
            // Trigger change detection
            this.selectedExtension = {...this.selectedExtension};
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

}