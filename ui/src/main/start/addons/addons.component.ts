import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Extension {
  id?: number;
  name: string;
  rating: number;
  description: string;
  reviews: number;
  category: string;
  image: string;
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
    image: ''
  };
  isCreating: boolean = false;
  isEditing: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchExtensions();
    this.fetchCategories();
  }

  fetchExtensions() {
    this.http.get<Extension[]>('/api/addons').subscribe(data => {
      this.filteredExtensions = data;
    });
  }

  fetchCategories() {
    this.http.get<string[]>('/api/addons/categories').subscribe(data => {
      this.categories = ['全部', ...data];
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.selectedExtension = null;
    if (category === '全部') {
      this.fetchExtensions();
    } else {
      this.http.get<Extension[]>(`/api/addons?category=${category}`).subscribe(data => {
        this.filteredExtensions = data;
      });
    }
  }

  viewDetails(extension: Extension) {
    this.selectedExtension = extension;
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
        image: ''
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
}