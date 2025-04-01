import { Component, ElementRef, Inject, ViewChild, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CharacterModelService } from '../../services/character-model.service';
import { CharacterModel } from '../../models/character-model';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  modelFile: File | null = null;
  metadata = {
    name: '',
    description: '',
    category: '',
    tags: [] as string[]
  };
  newTag: string = '';
  readonly modelCategories = [
    'Characters',
    'Vehicles',
    'Weapons',
    'Buildings',
    'Props',
    'Environment',
    'Animations',
    'Effects',
    'UI Elements',
    'Other'
  ];
  isDragging = false;
  tagSuggestions: string[] = [];
  activeSuggestionIndex = -1;
  availableTags: string[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<UploadDialogComponent>,
    private characterService: CharacterModelService,
    @Inject(MAT_DIALOG_DATA) public data?: CharacterModel
  ) {
    if (data) {
      this.metadata = {
        name: data.name,
        description: data.description,
        category: data.category,
        tags: [...data.tags]
      };
    }
    this.loadAvailableTags();
  }

  ngOnInit() {}

  loadAvailableTags() {
    this.characterService.getAllTags().subscribe(
      tags => this.availableTags = tags
    );
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.modelFile = file;
      this.metadata.name = file.name.split('.')[0];
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.close();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer?.files[0];
    if (file && this.isValidFileType(file)) {
      this.modelFile = file;
      this.metadata.name = file.name.split('.')[0];
    }
    this.isDragging = false;
  }

  private isValidFileType(file: File): boolean {
    const validTypes = ['.glb', '.gltf', '.fbx'];
    return validTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  addTag() {
    if (this.newTag && !this.metadata.tags.includes(this.newTag)) {
      this.metadata.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
  }

  onTagInput(event: KeyboardEvent) {
    if (this.newTag) {
      this.tagSuggestions = this.availableTags
        .filter((tag:any) => tag.toLowerCase().includes(this.newTag.toLowerCase())
          && !this.metadata.tags.includes(tag))
        .slice(0, 5);
    } else {
      this.tagSuggestions = [];
    }
  }

  selectTagSuggestion(tag: string) {
    this.metadata.tags.push(tag);
    this.newTag = '';
    this.tagSuggestions = [];
  }

  close() {
    this.dialogRef.close();
  }

  upload() {
    if (this.modelFile || this.data) {
      this.isLoading = true;
      this.errorMessage = '';

      const request = this.data 
        ? this.characterService.updateCharacter(this.data.id, {
            ...this.data,
            ...this.metadata
          })
        : this.characterService.uploadModel(this.modelFile!, this.metadata);

      request.subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.errorMessage = error.message || '上传失败，请重试';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
