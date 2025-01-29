import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterformComponent } from './components/registerform/registerform.component';
//import { AddressformComponent } from './components/addressform/addressform.component';
//import { SkillsFormComponent } from './components/skills-form/skills-form.component';
//import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RegisterformComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-front';
}
