import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { XMessageModule } from '@ng-nest/ui/message';
import { XMessageBoxModule } from '@ng-nest/ui/message-box';
import { AuAuthDirective } from './auth/auth.directive';
import { CommonModule } from '@angular/common';
import { XFindModule } from '@ng-nest/ui/find';
import { EntityDetailComponent } from './entity/entity-detail.component';
import { XAnchorModule, XButtonModule, XCardModule, XCheckboxModule, XCollapseModule, XFormModule, XIconModule, XInputModule, XLinkModule, XPageHeaderModule, XSelectModule, XTableModule, XTabsModule, XTagModule, XUploadModule,XInputNumberModule, XDialogModule } from '@ng-nest/ui';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SafeHtmlPipe } from 'src/pipes/safe-html.pipe';
import { EntityInfoComponent } from './entity/components/entity-info/entity-info.component';

// 视图
const declarations = [AuAuthDirective, EntityDetailComponent,EntityInfoComponent, SafeHtmlPipe];

// 模块
const modules = [FormsModule, CommonModule, RouterModule, FontAwesomeModule, ReactiveFormsModule, HttpClientModule, XMessageModule, XMessageBoxModule, XFindModule, XButtonModule, XIconModule, XUploadModule, XCollapseModule, LeafletModule, XTagModule, XCheckboxModule, XInputModule, XSelectModule, XLinkModule, XTableModule, XFormModule, XPageHeaderModule, XCardModule, QuillModule, XTabsModule, XAnchorModule, XInputNumberModule, XDialogModule];

/**
 * 共享模块
 */
@NgModule({
  declarations: [...declarations],
  imports: [...modules],
  exports: [...modules, ...declarations]
})
export class ShareModule { }
