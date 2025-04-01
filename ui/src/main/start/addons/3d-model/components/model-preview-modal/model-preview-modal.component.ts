import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CharacterModel } from '../../models/character-model';

@Component({
  selector: 'app-model-preview-modal',
  templateUrl: './model-preview-modal.component.html',
  styleUrls: ['./model-preview-modal.component.scss']
})
export class ModelPreviewModalComponent implements OnInit, AfterViewInit {
  modelLoading = true;
  
  constructor(
    public dialogRef: MatDialogRef<ModelPreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public model: CharacterModel
  ) {}

  ngOnInit() {
    console.log('Model preview modal initialized with model:', this.model);
    console.log('Preview URL:', this.model?.previewUrl);
  }

  ngAfterViewInit() {
    // Force layout recalculation to ensure proper sizing
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  onModelLoaded(success: boolean) {
    console.log('Model loaded event received:', success);
    this.modelLoading = !success;
    
    if (!success) {
      console.error('Failed to load model from URL:', this.model?.previewUrl);
    }
    
    // Force another resize event to ensure the model viewer adapts
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }

  close() {
    this.dialogRef.close();
  }
}
