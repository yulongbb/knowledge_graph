import { Component, signal } from '@angular/core';
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
  entityTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private knowledgeGraphService: AlgorithmService
  ) {
    this.form = this.fb.group({
      text: ['肖特360由330发展而来，对机身作了加长，以便利用美国撤销管制规定后产生的容积增长空间。360与330最明显的不同在于用常规尾翼替换了330的双尾翼。肖特360机型于1981年6月1日首飞，1982年12月1日在美国SuburbanAirlines航空公司开始服役。该机型共计交付了164架。']
    });
  }

  onSubmit() {
    const text = this.form.get('text')?.value;
    this.knowledgeGraphService.segmentText(text).subscribe(data => {
      this.words = data.words;
    });
    this.knowledgeGraphService.recognizeEntities(text).subscribe(data => {
      this.entities = data.entities;
      this.entityTypes = Object.keys(this.entities);
    });
    this.knowledgeGraphService.extractRelations(text).subscribe(data => {
      this.relations = data.relations;
    });
  }

}