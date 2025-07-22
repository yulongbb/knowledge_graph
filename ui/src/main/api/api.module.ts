import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { XMessageModule } from '@ng-nest/ui/message';
import { XButtonModule } from '@ng-nest/ui/button';
import { XInputModule } from '@ng-nest/ui/input';
import { XSelectModule } from '@ng-nest/ui/select';
import { XRadioModule } from '@ng-nest/ui/radio';
import { XListModule } from '@ng-nest/ui/list';
import { XFormModule } from '@ng-nest/ui/form';
import { XTreeModule } from '@ng-nest/ui/tree';
import { ApiAccessComponent } from './api-access.component';
import { ApiRoutesModule } from './api-routes.module';
import { XDropdownModule, XIconModule, XTextareaModule } from '@ng-nest/ui';
import { SparqlEditorComponent } from './sparql-editor/sparql-editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ApiService } from './api.service';

@NgModule({
  imports: [
    ApiRoutesModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    XMessageModule,
    XButtonModule,
    XInputModule,
    XSelectModule,
    XRadioModule,
    XListModule,
    XFormModule,
    XTreeModule,
    XDropdownModule,
    XIconModule,
    XTextareaModule,
    MonacoEditorModule.forRoot()
  ],
  declarations: [ApiAccessComponent, SparqlEditorComponent],
  exports: [ApiAccessComponent],
  providers: [ApiService], // 确保 NamespaceService 已注册
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ApiModule {}
