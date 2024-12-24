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
  entityTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private knowledgeGraphService: AlgorithmService
  ) {
    this.form = this.fb.group({
      text: ['70-1式自行榴弹炮是中国北方工业公司研制生产的。第一型未依靠俄国协助自行设计的履带式自行火炮，使用63式装甲运兵车的底盘为基础设计，是类似二战自行火炮的敞开式设计，是用装甲车加榴炮弹的结合体。工厂产品型号WZ302，共生产126辆。']
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