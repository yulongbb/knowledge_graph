import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutesModule } from './login-routes.module';
import { ShareModule } from 'src/share/share.module';
import { XInputModule } from '@ng-nest/ui/input';
import { XButtonModule } from '@ng-nest/ui/button';
import { XMessageModule } from '@ng-nest/ui/message';
import { XSelectModule } from '@ng-nest/ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ShareModule, XInputModule, XSelectModule, XButtonModule, XMessageModule, LoginRoutesModule],
  declarations: [LoginComponent]
})
export class LoginModule {}
