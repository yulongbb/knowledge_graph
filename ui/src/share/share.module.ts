import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { XMessageModule } from '@ng-nest/ui/message';
import { XMessageBoxModule } from '@ng-nest/ui/message-box';
import { AuAuthDirective } from './auth/auth.directive';
import { CommonModule } from '@angular/common';
import { XFindModule } from '@ng-nest/ui/find';
import { EntityDetailComponent } from './entity/entity-detail.component';
import { XButtonModule, XCardModule, XCheckboxModule, XCollapseModule, XFormModule, XIconModule, XInputModule, XLinkModule, XPageHeaderModule, XSelectModule, XTableModule, XTagModule, XUploadModule } from '@ng-nest/ui';
import { LeafletModule } from '@bluehalo/ngx-leaflet';


// 视图
const declarations = [AuAuthDirective, EntityDetailComponent];

// 模块
const modules = [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule, XMessageModule, XMessageBoxModule,XFindModule, XButtonModule, XIconModule, XUploadModule,XCollapseModule,LeafletModule, XTagModule, XCheckboxModule, XInputModule, XSelectModule, XLinkModule, XTableModule, XFormModule, XPageHeaderModule, XCardModule];

/**
 * 共享模块
 */
@NgModule({
  declarations: [...declarations],
  imports: [...modules],
  exports: [...modules, ...declarations]
})
export class ShareModule {}
