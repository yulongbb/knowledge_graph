import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuAuthDirective } from './auth/auth.directive';
import { CommonModule } from '@angular/common';
import { EntityDetailComponent } from './entity/entity-detail.component';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SafeHtmlPipe } from 'src/pipes/safe-html.pipe';
import { EntityInfoComponent } from './entity/components/entity-info/entity-info.component';
import { EntityAddComponent } from './entity/components/entity-add/entity-add.component';
import { EntityAddImageComponent } from './entity/components/entity-add-image/entity-add-image.component';
import { NgNestModule } from './ng-nest.module';

// 视图
const declarations = [
  AuAuthDirective,
  EntityDetailComponent,
  EntityInfoComponent,
  EntityAddComponent,
  EntityAddImageComponent,
  SafeHtmlPipe
];

// 模块
const modules = [
  FormsModule,
  CommonModule,
  RouterModule,
  FontAwesomeModule,
  ReactiveFormsModule,
  HttpClientModule,
  NgNestModule,
  LeafletModule,
  QuillModule
];

/**
 * 共享模块
 */
@NgModule({
  declarations: [...declarations],
  imports: [...modules],
  exports: [...modules, ...declarations]
})
export class ShareModule {}
