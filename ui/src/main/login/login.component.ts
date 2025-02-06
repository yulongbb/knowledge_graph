import { UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UntypedFormBuilder } from '@angular/forms';
import { XMessageService } from '@ng-nest/ui/message';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  // 登录的loding
  loading: boolean = false;

  userForm: UntypedFormGroup = this.formBuilder.group({
    account: ['admin'],
    password: ['admin123'],
    database: ['kgms']
  });
  data = signal(['kgms', 'demo']);

  constructor(
    public authService: AuthService,
    public router: Router,
    public formBuilder: UntypedFormBuilder,
    public message: XMessageService,
    public activatedRoute: ActivatedRoute,
    private location: Location

  ) { }

  ngOnInit() { }

  // 登录
  login() {
    if (this.loading == false) {
      let user = this.userForm.value;
      if (user.account && user.password) {
        this.loading = true;
        this.authService.login(user).subscribe(
          () => {
            if (this.authService.isLoggedIn) {
              console.log('登录成功');
              const queryParams = { keyword: '' }; // 可以设置默认值或动态值
              let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : `/${environment.index}`;
              this.router.navigate([redirect], { queryParams });
            }
          },
          () => {
            this.loading = false;
          },
          () => {
            this.loading = false;
          }
        );
      } else {
        this.message.warning('用户名或密码不能为空！');
      }
    }
  }
}
