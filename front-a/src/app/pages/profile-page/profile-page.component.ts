import { Component, OnInit, signal, Signal } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageInterface, skillsOrCompetenciesInterface, WorkExperienceInterface, educationInterface, addressInterface, UserDetailsInterface, ResultInterface } from '../../interfaces/interfaces.models';
import { AddressSectionComponent } from '../../components/address-section/address-section.component';
import { WorkSectionComponent } from '../../components/work-section/work-section.component';
import { ApiUserService } from '../../services/user/api.user.service';
import { EducationSectionComponent } from '../../components/education-section/education-section.component';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [CommonModule, SideBarComponent, AddressSectionComponent, WorkSectionComponent, EducationSectionComponent]
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

  activeTab: string = "languages";

  workEmpty = signal(false)
  educationEmpty = signal(false)

  // Mappings for levels (typed as Record<string, string>)
  degreeLevels: Record<string, string> = {
    'HS': 'High School',
    'AS': 'Associate\'s Degree',
    'BA': 'Bachelor\'s Degree',
    'MA': 'Master\'s Degree',
    'PhD': 'PhD',
    'OT': 'Other'
  };

  languageLevels: Record<string, string> = {
    'BE': 'Beginner',
    'IN': 'Intermediate',
    'AD': 'Advanced',
    'NA': 'Native'
  };

  constructor(
    private userService: ApiUserService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.loadUserData();

    if (this.latestWork == null) {

      this.workEmpty.set(true);
    }

    if (this.latestEducation == null) {

      this.educationEmpty.set(true);
    }

  }

  objectIsEmpty(objectValue: Object) {

    if (Object.keys(objectValue).length !== 0) {

      objectValue = true;

    }
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


    /* forkJoin({
      user: this.genericService.getOne('/users', userId),
      addresses: this.genericService.getAll(`/addresses/?user=${userId}`),
      educations: this.genericService.getAll(`/educations/?user=${userId}`),
      workExperiences: this.genericService.getAll(`/work_experiences/?user=${userId}`),
      languages: this.genericService.getAll(`/languages/?user=${userId}`),
      skills: this.genericService.getAll(`/skills/?user=${userId}`),
      competencies: this.genericService.getAll(`/competencies/?user=${userId}`)
    }).pipe(
      catchError(error => {
        console.error('Error loading data:', error);
        return throwError(() => new Error('Error loading user data'));
      })
    ).subscribe({

      next: (data) => {
        this.user = data.user || {};
        this.mainAddress = (data.addresses || []).filter((address: any) => address.user == userId)[0] || {};
        this.latestEducation = (data.educations || []).filter((edu: any) => edu.user == userId)[0] || {};
        this.latestWork = (data.workExperiences || []).filter((work: any) => work.user == userId)[0] || {};

        this.languages = (data.languages || []).filter((lang: any) => lang.user == userId);
        this.skills = (data.skills || []).filter((skill: skillsOrCompetenciesInterface) => skill.id == userId);
        this.competencies = (data.competencies || []).filter((comp: any) => comp.user == userId);

      }
    }); */

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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  }

  getCurrentPosition(currentlyWorking: boolean): string {
    return currentlyWorking ? 'Present' : 'Past Position';
  }

  // Método helper para obtener el nivel de grado sin argumentos
  /*
  getDegreeLevel(): string {
    if (this.latestEducation && this.latestEducation.degree_level) {
      return this.degreeLevels[this.latestEducation.degree_level] || this.latestEducation.degree_level;
    }
    return '';
  }*/ 
 
  // Método helper para obtener el nivel de idioma para cada registro
  getLanguageLevel(lang: any): string {
    if (lang && lang.language_level) {
      return this.languageLevels[lang.language_level] || lang.language_level;
    }
    return '';
  }
}
