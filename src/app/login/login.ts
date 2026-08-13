import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service/auth-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoginComponent {
  readonly loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.loginForm = formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.errorMessage = null;

    this.authService.login(username, password).subscribe({
      next: () => this.router.navigate(['/list']),
      error: () => {
        this.errorMessage = 'Invalid username or password.';
        this.cdr.detectChanges();
      },
    });
  }
}
