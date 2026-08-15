import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  inject,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    const formBuilder = inject(FormBuilder);

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
      next: () => void this.router.navigate(['/list']),
      error: () => {
        this.errorMessage = 'Invalid username or password.';
        this.cdr.detectChanges();
      },
    });
  }
}
