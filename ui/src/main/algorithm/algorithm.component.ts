import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlgorithmService } from './algorithm.service';

@Component({
  selector: 'app-algorithm',
  templateUrl: './algorithm.component.html',
  styleUrls: ['./algorithm.component.css']
})
export class AlgorithmComponent {
  form: FormGroup;
  words: string[] = [];
  entities: any;
  relations: any;
  segmentText: string = '';
  recognizeText: string = '';
  extractText: string = '';
  showSegmentApi: boolean = false;
  showRecognizeApi: boolean = false;
  showExtractApi: boolean = false;

  constructor(
    private fb: FormBuilder,
    private knowledgeGraphService: AlgorithmService
  ) {
    this.form = this.fb.group({
      text: ['孙玉龙在北京上学']
    });
  }

  onSubmit() {
    const text = this.form.get('text')?.value;
    this.knowledgeGraphService.segmentText(text).subscribe(data => {
      this.words = data.words;
      this.knowledgeGraphService.recognizeEntities(this.words).subscribe(data => {
        this.entities = data.entities;
        this.knowledgeGraphService.extractRelations(this.entities).subscribe(data => {
          this.relations = data.relations;
        });
      });
    });
  }

  testSegment() {
    this.knowledgeGraphService.segmentText(this.segmentText).subscribe(data => {
      this.words = data.words;
    });
  }

  testRecognize() {
    const words = this.recognizeText.split(' ');
    this.knowledgeGraphService.recognizeEntities(words).subscribe(data => {
      this.entities = data.entities;
    });
  }

  testExtract() {
    const entities = JSON.parse(this.extractText);
    this.knowledgeGraphService.extractRelations(entities).subscribe(data => {
      this.relations = data.relations;
    });
  }

  toggleSegmentApi() {
    this.showSegmentApi = !this.showSegmentApi;
  }

  toggleRecognizeApi() {
    this.showRecognizeApi = !this.showRecognizeApi;
  }

  toggleExtractApi() {
    this.showExtractApi = !this.showExtractApi;
  }
}