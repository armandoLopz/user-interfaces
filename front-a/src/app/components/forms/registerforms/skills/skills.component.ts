import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PERSONAL_INFO_FORM_ROUTE } from '../../../../app.routes.constans';
import { LOGIN_ROUTE } from '../../../../app.routes.constans';

@Component({
  selector: 'app-skills',
  imports: [RouterLink],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent {

  LOGIN_FORM = LOGIN_ROUTE
  PERSONAL_INFO_FORM = PERSONAL_INFO_FORM_ROUTE
}
