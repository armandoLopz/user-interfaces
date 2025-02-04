import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LOGIN_ROUTE, SKILLS_FORM_ROUTE } from '../../../../app.routes.constans';
import { RouterLink } from '@angular/router';
import { addressInterface, userInterface, LanguageInterface } from '../../../../interfaces/interfaces.models';
import { MapComponent } from '../../../map/map/map.component';
import { ShareDataService } from '../../../../services/shared-data/share-data.service';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../../../services/generic/generic.service';
import { forkJoin, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { LoadingComponent } from '../../../loading/loading.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { loadingFuntion } from '../../../../utils/funtions';
import { userAuth } from '../../../../interfaces/interfaces.models';

@Component({
  selector: 'app-personal-info',
  imports: [MapComponent, RouterLink, FormsModule, CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent {

  registrationForm: FormGroup;

  constructor(
    private router: Router,
    private shareDataService: ShareDataService,
    private fb: FormBuilder,
    private genericService: GenericService<any>,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      personal_site: ['', Validators.required],
      cellphone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      languages: ['', Validators.required],
      language_level: ['', Validators.required],
      personal_description: ['', Validators.required]
    })
  }

  loading = false;

  LOGIN_ROUTE = LOGIN_ROUTE;
  SKILLS_FORM = SKILLS_FORM_ROUTE;

  // Definir el objeto de usuario
  userData: userInterface = {
    first_name: '',
    last_name: '',
    email: '',
    cellphone: '',
    personal_description: '',
    personal_site: '',
    password: '',
    username: '',
  };

  //For Login funtion
  userAuth: userAuth = {

    username: '',
    password: ''
  }
  
  // Para almacenar la dirección recibida
  addressData: addressInterface = {
    country: '',
    city: '',
    street: ''
  };

  // Definir el objeto de datos de lenguaje
  languageData: LanguageInterface = {
    name: '',
    language_level: ''
  };
  // Variables de validación de la contraseña
  passwordValidLength: boolean = false;
  passwordHasUppercase: boolean = false;
  passwordHasLowercase: boolean = false;
  passwordHasNumber: boolean = false;

  // Para mostrar u ocultar la contraseña
  showPassword: boolean = false;

  onLogin() {
    loadingFuntion(this.authService, this.userAuth, (loading: boolean) => {
      this.loading = loading;
    });
  }

  // Función que valida los requisitos de la contraseña
  validatePassword(): void {
    const password = this.userData.password;

    // Validación de longitud
    this.passwordValidLength = password.length >= 8;

    // Validación de una letra mayúscula
    this.passwordHasUppercase = /[A-Z]/.test(password);

    // Validación de una letra minúscula
    this.passwordHasLowercase = /[a-z]/.test(password);

    // Validación de un número
    this.passwordHasNumber = /\d/.test(password);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Capturar los datos del mapa
  onAddressSelected(address: addressInterface) {
    this.addressData = address;
  }

  // Método que recoge los datos del formulario
  handleFormSubmit() {
    if (this.registrationForm.valid) {
      // Actualizar userData con los valores del formulario
      this.userData = {
        ...this.userData,
        first_name: this.registrationForm.value.name,
        last_name: this.registrationForm.value.lastname,
        email: this.registrationForm.value.email,
        username: this.registrationForm.value.username,
        personal_site: this.registrationForm.value.personal_site,
        cellphone: this.registrationForm.value.cellphone,
        password: this.registrationForm.value.password,
        personal_description: this.registrationForm.value.personal_description
      };

      this.languageData = {
        name: this.registrationForm.value.languages,
        language_level: this.registrationForm.value.language_level
      };

      // Crear el usuario
      this.genericService.create("/users/", this.userData).pipe(
        switchMap(userResponse => {
          if (!userResponse || !userResponse.id) {
            return throwError(() => new Error("Error creating user: No ID returned"));
          }

          const userId = userResponse.id;

          // Asignamos el ID del usuario a las demás entidades
          this.addressData.user = [userId];
          this.languageData.user = [userId];
          
          //servicio
          console.log("enviado");
          this.shareDataService.setUserData(userId)

          return forkJoin({
            address: this.genericService.create("/addresses/", this.addressData),
            languages: this.genericService.create("/languages/", this.languageData),
            
          }).pipe(
            catchError(error => {
              console.error("Error en la creación de entidades:", error);
              
              // Si alguna solicitud falla, eliminamos el usuario
              return this.genericService.delete("/users/", userId).pipe(
                switchMap(() => throwError(() => new Error("Error submitting data, user deleted"))),
                catchError(deleteError => {
                  console.error("Error al eliminar usuario:", deleteError);
                  return throwError(() => new Error("Error submitting data, but failed to delete user"));
                })
              );
            })
          );
        })
      ).subscribe({
        next: () => {

          this.router.navigate([this.SKILLS_FORM]);
        },
        error: err => {
          console.error("Error:", err);
          alert(err.message);
        }
      });

    } else {
      alert('Form is invalid');
    }
  }

}