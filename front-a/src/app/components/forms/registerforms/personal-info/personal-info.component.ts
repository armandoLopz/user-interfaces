import { Component } from '@angular/core';
import { MapComponent } from '../../../map/map/map.component';
import { LOGIN_ROUTE, SKILLS_FORM_ROUTE } from '../../../../app.routes.constans';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-personal-info',
  imports: [MapComponent, RouterLink],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoComponent {

  LOGIN_ROUTE = LOGIN_ROUTE
  SKILLS_FORM = SKILLS_FORM_ROUTE
}
