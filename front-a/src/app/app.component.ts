import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { LoginFormComponent } from './components/forms/loginform/login.form/login.form.component';
import { AddressFormComponent } from './components/forms/registerforms/address-form/address-form.component';
import { PersonalInfoComponent } from './components/forms/registerforms/personal-info/personal-info.component';
import { SkillsComponent } from './components/forms/registerforms/skills/skills.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddressFormComponent, PersonalInfoComponent, SkillsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Portfolio';
}
