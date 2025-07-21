import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sparql-editor',
  templateUrl: './sparql-editor.component.html',
  styleUrls: ['./sparql-editor.component.scss'],
})
export class SparqlEditorComponent {
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();

  editorOptions = {
    theme: 'vs-light',
    language: 'sparql',
    automaticLayout: true,
    fontSize: 15,
    minimap: { enabled: false },
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
  };

  onEditorChange(value: string) {
    this.queryChange.emit(value);
  }
}
