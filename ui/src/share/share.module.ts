import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { XMessageModule } from '@ng-nest/ui/message';
import { XMessageBoxModule } from '@ng-nest/ui/message-box';
import { AuAuthDirective } from './auth/auth.directive';
import { CommonModule } from '@angular/common';
import { XFindModule } from '@ng-nest/ui/find';


// 视图
const declarations = [AuAuthDirective];

// 模块
const modules = [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule, XMessageModule, XMessageBoxModule,XFindModule];

/**
 * 共享模块
 */
@NgModule({
  declarations: [...declarations],
  imports: [...modules],
  exports: [...modules, ...declarations]
})
export class ShareModule {}
