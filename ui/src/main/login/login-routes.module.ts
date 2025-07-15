import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { 
    path: '',  
    component: LoginComponent,
    data: { skipAuthGuard: true } // 标记登录页面跳过权限验证
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class LoginRoutesModule { }
