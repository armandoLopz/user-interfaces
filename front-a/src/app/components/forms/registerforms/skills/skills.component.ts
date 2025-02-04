import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PERSONAL_INFO_FORM_ROUTE } from '../../../../app.routes.constans';
import { LOGIN_ROUTE } from '../../../../app.routes.constans';
import { DateFieldsComponent } from '../../../date-fields/date-fields.component';
import { ShareDataService } from '../../../../services/shared-data/share-data.service';
import { addressInterface, LanguageInterface, skillsOrCompetenciesInterface, userInterface } from '../../../../interfaces/interfaces.models';
import { educationInterface } from '../../../../interfaces/interfaces.models';
import { WorkExperienceInterface } from '../../../../interfaces/interfaces.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, switchMap, throwError } from 'rxjs';
import { GenericService } from '../../../../services/generic/generic.service';

@Component({
  selector: 'app-skills',
  imports: [RouterLink, DateFieldsComponent, FormsModule, CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent {

  constructor(
    private shareDataService: ShareDataService,
    private genericService: GenericService<any>
  ) { }

  skillLevel: number = 1;
  competencyLevel: number = 1;

  LOGIN_FORM: string = LOGIN_ROUTE
  PERSONAL_INFO_FORM: string = PERSONAL_INFO_FORM_ROUTE

  languageData: LanguageInterface | null = {

    name: '',
    language_level: ''
  }

  userData: userInterface | null = {

    name: '',
    lastname: '',
    email: '',
    cellphone: '',
    personal_description: '',
    personal_site: '',
    password: '',
    username: '',

  }

  addressData: addressInterface | null = {

    country: '',
    city: '',
    street: ''
  }

  skillData: skillsOrCompetenciesInterface = {
    name: '',
    proficiency: 0,
  };

  competencieData: skillsOrCompetenciesInterface = {
    name: '',
    proficiency: 0,
  };

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
    description_of_the_job: "",
    start_work_date: new Date(),
    end_work_date: new Date(),
    currently_working: false
  }


  ngOnInit(): void {

    this.addressData = this.shareDataService.getAllData().address
    this.userData = this.shareDataService.getAllData().user
    this.languageData = this.shareDataService.getAllData().language
    
  }

  onSubmit(formData: any): void {
    this.educationData = {
      name_institution: formData.institute_name,
      degree_studied: formData.degree_level,
      start_studied_date: this.educationData.start_studied_date,
      end_studied_date: this.educationData.end_studied_date,
      currently_studying: this.educationData.currently_studying,
      degree_level_other: formData.degree_level === "OT" ? formData.degree_level_other : "N/A",
      degree_level: formData.degree_level
    };

    this.workData = {
      name_company: formData.company_name,
      description_of_the_job: formData.job_description,
      start_work_date: this.workData.start_work_date,
      end_work_date: this.workData.end_work_date,
      currently_working: this.workData.currently_working
    };

    this.skillData = {
      name: formData.skills,
      proficiency: formData.skill_level
    };

    this.competencieData = {
      name: formData.competencies,
      proficiency: formData.competencies_level
    };
    
    this.genericService.create("/users/", this.userData).pipe(
      switchMap(userResponse => {
        if (!userResponse || !userResponse.id) {
          return throwError(() => new Error("Error creating user: No ID returned"));
        }

        const userId = userResponse.id;

        // Asignamos el ID del usuario a las demás entidades
        if (this.addressData) this.addressData.user = [userId];
        if (this.workData) this.workData.user = [userId];
        if (this.educationData) this.educationData.user = [userId];
        if (this.languageData) this.languageData.user = [userId];
        if (this.skillData) this.skillData.user = [userId];
        if (this.competencieData) this.competencieData.user = [userId];

        return forkJoin({
          address: this.genericService.create("/addresses/", this.addressData),
          work: this.genericService.create("/work_experiences/", this.workData),
          education: this.genericService.create("/educations/", this.educationData),
          languages: this.genericService.create("/languages/", this.languageData),
          skill: this.genericService.create("/skills/", this.skillData),
          competencie: this.genericService.create("/competencies/", this.competencieData)
        }).pipe(
          catchError(error => {
            // Si alguna solicitud falla, eliminamos el usuario
            return this.genericService.delete("/users/", userId)
              .pipe(
                switchMap(() => throwError(() => new Error("Error submitting data, user deleted"))),
                catchError(deleteError => {
                  console.error("Error deleting user:", deleteError);
                  return throwError(() => new Error("Error submitting data, but failed to delete user"));
                })
              );
          })
        );
      })
    ).subscribe({
      next: responses => {
        console.log("Data submitted successfully:", responses);
      },
      error: err => {
        console.error("Error:", err);
      }
    });

    // Realizar solicitudes simultáneas para enviar los datos
    /*forkJoin({
      user: this.genericService.create("/users/", this.userData),
      address: this.genericService.create("/addresses/", this.addressData),
      work: this.genericService.create("/work_experiences/", this.workData),
      education: this.genericService.create("/educations/", this.educationData),
      languages: this.genericService.create("/languages/", this.languageData),
      skill: this.genericService.create("/skills/", this.skillData),
      competencie: this.genericService.create("/competencies/", this.competencieData)

    }).subscribe({
      next: (responses) => {
        console.log("Data submitted successfully:", responses);
      },
      error: (err) => {
        console.error("Error submitting data:", err);
      },
    });*/

  }


  handleDatesChanged(event: { startDate: string, endDate: string, isCurrent: boolean }, type: string) {
    if (type === 'education') {

      this.educationData.start_studied_date = new Date(event.startDate)
      this.educationData.end_studied_date = new Date(event.endDate)
      this.educationData.currently_studying = event.isCurrent


    } else if (type === 'work') {

      this.workData.start_work_date = new Date(event.startDate)
      this.workData.end_work_date = new Date(event.endDate)
      this.workData.currently_working = event.isCurrent
    }
  }

}
