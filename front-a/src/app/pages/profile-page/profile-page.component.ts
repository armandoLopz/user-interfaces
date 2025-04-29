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
    // Asegúrate de que los datos de usuario estén cargados antes de intentar imprimir
    if (this.user()) {
        this.showCvPreview.set(true);
        // Aumenta el retraso para dar tiempo al navegador a renderizar el CV
        // antes de abrir el diálogo de impresión. Esto suele solucionar el problema del blanco.
        setTimeout(() => {
          window.print();
          // Opcional: Puedes añadir lógica aquí para ocultar el CV preview
          // después de que el diálogo de impresión se cierre, usando el evento afterprint.
          // window.addEventListener('afterprint', () => this.showCvPreview.set(false), { once: true });
        }, 50); // Puedes ajustar este valor (ej: 50, 100, 200) si 50ms no es suficiente
    } else {
        console.warn("Datos de usuario no cargados. No se puede imprimir el CV.");
        // Opcional: Muestra un mensaje al usuario indicando que espere
    }
  }
}