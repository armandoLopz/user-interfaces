import { Component } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { BasicInfoUserModalComponent } from '../../components/modals/basic-info-user-modal/basic-info-user-modal.component';
import { SkillsInfoUserModalComponent } from '../../components/modals/skills-info-user-modal/skills-info-user-modal.component';
import { EducationWorkInfoUserModalComponent } from '../../components/modals/education-work-info-user-modal/education-work-info-user-modal.component';


@Component({
  selector: 'app-profile-page',
  imports: [SideBarComponent, BasicInfoUserModalComponent, SkillsInfoUserModalComponent, EducationWorkInfoUserModalComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
