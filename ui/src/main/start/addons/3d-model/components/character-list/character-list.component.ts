import { Component, OnInit } from '@angular/core';
import { CharacterFilter, CharacterModel } from '../../models/character-model';
import { CharacterModelService } from '../../services/character-model.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit {
  characters: CharacterModel[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedTags: string[] = [];
  availableTags: string[] = [];
  categories: string[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private characterService: CharacterModelService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCharacters();
    this.loadCategories();
    this.loadTags();
    this.applyFilters();
  }

  loadCharacters() {
    this.isLoading = true;
    this.errorMessage = '';

    this.characterService.getCharacters().pipe(
      finalize(() => {
        this.isLoading = false;
        console.log('Characters loaded:', this.characters); // 添加日志
      }),
      catchError(error => {
        this.errorMessage = error.message || '加载失败，请重试';
        console.error('Load error:', error); // 添加错误日志
        return of([]);
      })
    ).subscribe(data => {
      this.characters = data;
      this.applyFilters(); // 应用当前筛选条件
    });
  }

  deleteCharacter(id: string) {
    if (confirm('确定要删除这个模型吗？')) {
      this.isLoading = true;
      this.characterService.deleteCharacter(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.loadCharacters();
          },
          error: (error) => {
            this.errorMessage = error.message || '删除失败，请重试';
          }
        });
    }
  }

  applyFilters() {
    this.isLoading = true;
    const filter: CharacterFilter = {
      search: this.searchTerm,
      category: this.selectedCategory,
      tags: this.selectedTags
    };

    this.characterService.searchCharacters(filter).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.characters = data;
        console.log('Filtered characters:', data); // 添加日志
      },
      error: (error) => {
        this.errorMessage = error.message || '搜索失败，请重试';
        console.error('Search error:', error); // 添加错误日志
      }
    });
  }

  loadCategories() {
    this.characterService.getAllCategories().subscribe(
      data => this.categories = data
    );
  }

  loadTags() {
    this.characterService.getAllTags().subscribe(
      data => this.availableTags = data
    );
  }

  openUploadDialog() {
    const dialogRef = this.dialog.open(UploadDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCharacters();
        this.loadTags(); // 重新加载标签
        this.loadCategories(); // 重新加载分类
      }
    });
  }

  removeTag(tag: string) {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
    this.applyFilters();
  }

  editCharacter(id: string) {
    const character = this.characters.find(c => c.id === id);
    if (character) {
      const dialogRef = this.dialog.open(UploadDialogComponent, {
        width: '600px',
        data: character
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadCharacters();
        }
      });
    }
  }
}
