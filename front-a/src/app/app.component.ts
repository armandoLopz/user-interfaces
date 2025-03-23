import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterReactiveFormComponent } from './components/forms/registerforms/register-reactive-form/register-reactive-form.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RegisterReactiveFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Portfolio';
}
