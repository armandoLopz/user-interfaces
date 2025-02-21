import { Component, Input } from '@angular/core';
import { PROFILE_PAGE_ROUTE, SETTING_PAGE_ROUTE } from '../../app.routes.constans';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, AvatarComponent],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {

  @Input() mainTitle: string = "";
  PROFILE_PAGE = PROFILE_PAGE_ROUTE
  SETTING_PAGE = SETTING_PAGE_ROUTE  
}
