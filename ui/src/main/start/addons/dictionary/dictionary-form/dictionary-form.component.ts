import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dictionary-form',
  templateUrl: './dictionary-form.component.html',
  styleUrls: ['./dictionary-form.component.less']
})
export class DictionaryFormComponent {
  @Input() set data(value: any) {
    if (value) {
      this.form.patchValue(value);
    }
  }
  @Output() formSubmit = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  getFormValue() {
    return this.form.valid ? this.form.value : null;
  }
}
