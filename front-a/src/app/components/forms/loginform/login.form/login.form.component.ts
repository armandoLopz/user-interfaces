import { Component } from '@angular/core';
import { PERSONAL_INFO_FORM_ROUTE } from '../../../../app.routes.constans';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [RouterLink],
  templateUrl: './login.form.component.html',
  styleUrl: './login.form.component.css'
})
export class LoginFormComponent {

  PERSONAL_INFO_ROUTE: string = PERSONAL_INFO_FORM_ROUTE

}
