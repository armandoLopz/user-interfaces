import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ADMIN_PAGE_ROUTE } from '../../app.routes.constans';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-h-page',
  imports: [RouterLink, LoaderComponent],
  templateUrl: './h-page.component.html',
  styleUrl: './h-page.component.css'
})
export class HPageComponent implements OnInit{

  ADMIN_PAGE = ADMIN_PAGE_ROUTE
  loading: boolean = true
  
  ngOnInit() {
    // Simulate loading time
    setTimeout(() => {
      this.loading = false
    }, 30000)
  }
}
