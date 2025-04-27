import { Component, OnInit, signal, Signal } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageInterface, skillsOrCompetenciesInterface, WorkExperienceInterface, educationInterface, addressInterface, UserDetailsInterface, ResultInterface } from '../../interfaces/interfaces.models';
import { AddressSectionComponent } from '../../components/address-section/address-section.component';
import { WorkSectionComponent } from '../../components/work-section/work-section.component';
import { ApiUserService } from '../../services/user/api.user.service';
import { EducationSectionComponent } from '../../components/education-section/education-section.component';
import { TabComponent } from '../../components/tab/tab.component';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [CommonModule, SideBarComponent, AddressSectionComponent, WorkSectionComponent, EducationSectionComponent, TabComponent]
})
export class ProfilePageComponent implements OnInit {

  // Main Data
  user = signal<ResultInterface | null>(null);

  mainAddress = signal<addressInterface[]>([]);
  latestEducation = signal<educationInterface[]>([]);
  latestWork = signal<WorkExperienceInterface[]>([]);
  languages = signal<LanguageInterface[]>([])
  skills = signal<skillsOrCompetenciesInterface[]>([]);
  competencies = signal<skillsOrCompetenciesInterface[]>([]);

  constructor(
    private userService: ApiUserService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.loadUserData();

  }

  private loadUserData(): void {

    const userId = this.getUserIdFromToken();

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getAllUserDetails(userId).subscribe({
      next: (data: UserDetailsInterface) => {
        
        this.user.set(data.result),        
        this.mainAddress.set(data.result.addresses)
        this.latestEducation.set(data.result.educations)
        this.latestWork.set(data.result.work_experiences)
        this.languages.set(data.result.languages)
        this.skills.set(data.result.skills)
        this.competencies.set(data.result.competencies)
        
      },
      error: (error) => {
        console.error("Error fetching user details:", error);
      },
    });

  }

  private getUserIdFromToken(): number | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

}
