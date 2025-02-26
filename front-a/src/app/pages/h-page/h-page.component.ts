import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ADMIN_PAGE_ROUTE } from '../../app.routes.constans';

@Component({
  selector: 'app-h-page',
  imports: [RouterLink],
  templateUrl: './h-page.component.html',
  styleUrl: './h-page.component.css'
})
export class HPageComponent {

  ADMIN_PAGE = ADMIN_PAGE_ROUTE

}
