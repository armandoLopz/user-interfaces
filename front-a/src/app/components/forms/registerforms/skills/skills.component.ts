import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LOGIN_ROUTE } from '../../../../app.routes.constans';
import { DateFieldsComponent } from '../../../date-fields/date-fields.component';
import { ShareDataService } from '../../../../services/shared-data/share-data.service';
import { skillsOrCompetenciesInterface, educationInterface, WorkExperienceInterface } from '../../../../interfaces/interfaces.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, catchError, throwError } from 'rxjs';
import { GenericService } from '../../../../services/generic/generic.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RouterLink, DateFieldsComponent, FormsModule, CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {

  constructor(
    private shareDataService: ShareDataService,
    private genericService: GenericService<any>,
    private router: Router
  ) { }

  skillLevel: number = 1;
  competencyLevel: number = 1;
  LOGIN_FORM: string = LOGIN_ROUTE;
  userId: number | null = null;

  // Los modelos se mantienen con fechas tipo Date
  skillData: skillsOrCompetenciesInterface = { name: '', proficiency: 0 };
  competencieData: skillsOrCompetenciesInterface = { name: '', proficiency: 0 };
  educationData: educationInterface = {
    name_institution: "",
    degree_studied: "",
    start_studied_date: new Date(),
    end_studied_date: new Date(),
    currently_studying: false,
    degree_level_other: "N/A",
    degree_level: "BA"
  };
  workData: WorkExperienceInterface = {
    name_company: "",
    job_title: "",
    description_of_the_job: "",
    start_work_date: new Date(),
    end_work_date: new Date(),
    currently_working: false
  };

  ngOnInit(): void {
    const userData: any = this.shareDataService.getAllData().user;
    if (userData) {
      this.userId = userData;
      console.log("User ID:", this.userId);
    } else {
      console.error("User ID not found in shared data.");
    }
  }

  /**
   * Convierte un Date o string a una cadena en formato "YYYY-MM-DD".
   */
  formatDate(date: Date | string): string {
    if (!date) return "";
    return new Date(date).toISOString().split('T')[0];
  }
  
  onSubmit(): void {
    if (!this.userId) {
      alert("User ID is missing, cannot proceed with submission.");
      return;
    }
  
    // Asignar userId a las entidades
    this.educationData.user = [this.userId];
    this.workData.user = [this.userId];
    this.skillData.user = [this.userId];
    this.competencieData.user = [this.userId];
  
    // Aseguramos que degree_studied tenga un valor (copiando de degree_level si es necesario)
    this.educationData.degree_studied = this.educationData.degree_level;
  
    // Crear payload para education y work (ya con fechas formateadas)
    const educationPayload = {
      ...this.educationData,
      start_studied_date: this.formatDate(this.educationData.start_studied_date),
      end_studied_date: this.formatDate(this.educationData.end_studied_date)
    };
  
    const workPayload = {
      ...this.workData,
      start_work_date: this.formatDate(this.workData.start_work_date),
      end_work_date: this.formatDate(this.workData.end_work_date)
    };
  
    // Crear payload para skills con los nombres de campos que espera la API
    const skillPayload = {
      skill_name: this.skillData.name,
      skill_proficiency: this.skillData.proficiency,
      user: this.skillData.user
    };
  
    // Crear payload para competencies con los nombres de campos que espera la API
    const competenciePayload = {
      name_competencies: this.competencieData.name,
      competencies_proficiency: this.competencieData.proficiency,
      user: this.competencieData.user
    };
  
    forkJoin({
      work: this.genericService.create("/work_experiences/", workPayload),
      education: this.genericService.create("/educations/", educationPayload),
      skill: this.genericService.create("/skills/", skillPayload),
      competencie: this.genericService.create("/competencies/", competenciePayload)
    }).pipe(
      catchError(error => {
        console.error("Error submitting data:", error);
        return throwError(() => new Error("Error submitting data"));
      })
    ).subscribe({
      next: () => {
        this.router.navigate([this.LOGIN_FORM]);
      },
      error: err => {
        alert("Error:"+ err);
      }
    });
  }
    

  /**
   * Actualiza las fechas en los modelos de education o work usando el formato "YYYY-MM-DD".
   * Nota: Aquí se actualiza el modelo con el string formateado, pero para evitar conflictos
   * de tipos, se recomienda que en el onSubmit() se creen objetos payload (como se hizo arriba).
   */
  handleDatesChanged(event: { startDate: string, endDate: string, isCurrent: boolean }, type: string) {
    if (type === 'education') {
      this.educationData = { 
        ...this.educationData, 
        // Se actualiza el modelo temporalmente, aunque el onSubmit() creará un payload con fechas formateadas.
        start_studied_date: new Date(event.startDate), 
        end_studied_date: new Date(event.endDate), 
        currently_studying: event.isCurrent 
      };
    } else if (type === 'work') {
      this.workData = { 
        ...this.workData, 
        start_work_date: new Date(event.startDate), 
        end_work_date: new Date(event.endDate), 
        currently_working: event.isCurrent 
      };
    }
  }
}
