import { Component } from '@angular/core';
import { PERSONAL_INFO_FORM_ROUTE } from '../../../../app.routes.constans';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { userAuth } from '../../../../interfaces/interfaces.models';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ADMIN_PAGE_ROUTE } from '../../../../app.routes.constans';
import { tokenRequest } from '../../../../interfaces/interfaces.models';
import { LoadingComponent } from '../../../loading/loading.component';

@Component({
  selector: 'app-login-form',
  imports: [RouterLink, FormsModule, LoadingComponent],
  templateUrl: './login.form.component.html',
  styleUrl: './login.form.component.css'
})
export class LoginFormComponent {

  constructor(private authService: AuthService, private router: Router) { }

  admin_page: string = ADMIN_PAGE_ROUTE

  user: userAuth = {

    username: "",
    password: ""

  }
  
  loading: boolean = false
  PERSONAL_INFO_ROUTE: string = PERSONAL_INFO_FORM_ROUTE

  login() {

    this.loading = true
    this.authService.login(this.user).subscribe({
      
      next: (response: tokenRequest) => {

        const accessToken = response?.access;

        if (accessToken) {

          localStorage.setItem('access_token', accessToken);
          this.router.navigate([this.admin_page]);

        } else {
          console.error('No se encontró el token en la respuesta.');
        }

      },
      error: (err) => {
        console.log(Response);

        console.error('Error en login:', err);
        alert('Error en login: ' + (err.error?.message || 'Intenta de nuevo'));
        this.loading = false;
      },
      complete: () => {
          this.loading = false;
      }
    });
  }
}