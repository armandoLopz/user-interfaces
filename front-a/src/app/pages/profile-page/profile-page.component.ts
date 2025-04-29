import { Component, OnInit, signal } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiUserService } from '../../services/user/api.user.service';
import { AddressSectionComponent } from '../../components/address-section/address-section.component';
import { WorkSectionComponent } from '../../components/work-section/work-section.component';
import { EducationSectionComponent } from '../../components/education-section/education-section.component';
import { TabComponent } from '../../components/tab/tab.component';
import { CvComponent } from '../../components/cv/cv.component';
import { getUserIdFromToken } from '../../utils/getToken';
import {
  addressInterface,
  educationInterface,
  LanguageInterface,
  ResultInterface,
  skillsOrCompetenciesInterface,
  WorkExperienceInterface,
  UserDetailsInterface
} from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    SideBarComponent,
    AddressSectionComponent,
    WorkSectionComponent,
    EducationSectionComponent,
    TabComponent,
    CvComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
})
export class ProfilePageComponent implements OnInit {
  user = signal<ResultInterface | null>(null);
  mainAddress = signal<addressInterface[]>([]);
  latestEducation = signal<educationInterface[]>([]);
  latestWork = signal<WorkExperienceInterface[]>([]);
  languages = signal<LanguageInterface[]>([]);
  skills = signal<skillsOrCompetenciesInterface[]>([]);
  competencies = signal<skillsOrCompetenciesInterface[]>([]);
  showCvPreview = signal(false);

  constructor(
    private userService: ApiUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = getUserIdFromToken();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.userService.getAllUserDetails(userId).subscribe({
      next: (data: UserDetailsInterface) => {
        this.user.set(data.result);
        this.mainAddress.set(data.result.addresses);
        this.latestEducation.set(data.result.educations);
        this.latestWork.set(data.result.work_experiences);
        this.languages.set(data.result.languages);
        this.skills.set(data.result.skills);
        this.competencies.set(data.result.competencies);
      },
      error: console.error
    });
  }

  printCV() {
    this.showCvPreview.set(true);
    setTimeout(() => window.print(), 0);
  }
}