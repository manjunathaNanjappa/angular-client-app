import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent {
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private nzMessageService: NzMessageService
  ) {}

  validateForm = this.formBuilder.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      let formValue = this.validateForm.value;

      this.authService.login(formValue.email, formValue.password).subscribe({
        next: (data) => {
          localStorage.setItem('token', data.token);
          this.nzMessageService.success('Login successful');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log('err.error.message', err.error.message);
          this.nzMessageService.error(err.error.message);
        },
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
