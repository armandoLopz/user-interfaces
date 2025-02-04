import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../services/generic/generic.service';
import { forkJoin, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
type DegreeLevelKey = 'HS' | 'AS' | 'BA' | 'MA' | 'PhD' | 'OT';
type LanguageLevelKey = 'BE' | 'IN' | 'AD' | 'NA';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [CommonModule,SideBarComponent]
})
export class ProfilePageComponent implements OnInit {
  user: any = {};
  mainAddress: any = {};
  latestEducation: any = {};
  latestWork: any = {};
  languages: any[] = [];
  skills: any[] = [];
  competencies: any[] = [];

  degreeLevels: Record<DegreeLevelKey, string> = {
    'HS': 'High School',
    'AS': 'Associate\'s degree',
    'BA': 'Bachelor\'s degree',
    'MA': 'Master\'s degree',
    'PhD': 'PhD',
    'OT': 'Other'
  };

  languageLevels: Record<LanguageLevelKey, string> = {
    'BE': 'Beginner',
    'IN': 'Intermediate',
    'AD': 'Advanced',
    'NA': 'Native'
  };

  constructor(
    private genericService: GenericService<any>,
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

    forkJoin({
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
        this.mainAddress = data.addresses?.[0] || {};
        this.latestEducation = data.educations?.[0] || {};
        this.latestWork = data.workExperiences?.[0] || {};
        this.languages = data.languages || [];
        this.skills = data.skills || [];
        this.competencies = data.competencies || [];
      }
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  getDegreeLevel(level: string): string {
    return this.degreeLevels[level as DegreeLevelKey] || level;
  }

  getLanguageLevel(level: string): string {
    return this.languageLevels[level as LanguageLevelKey] || level;
  }

  getCurrentPosition(currentlyWorking: boolean): string {
    return currentlyWorking ? 'Presente' : 'Finalizado';
  }
}