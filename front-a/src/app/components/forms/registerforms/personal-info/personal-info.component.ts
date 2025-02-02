import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LOGIN_ROUTE, SKILLS_FORM_ROUTE } from '../../../../app.routes.constans';
import { RouterLink } from '@angular/router';
import { addressInterface, userInterface, LanguageInterface } from '../../../../interfaces/interfaces.models';
import { MapComponent } from '../../../map/map/map.component';
import { ShareDataService } from '../../../../services/shared-data/share-data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-info',
  imports: [MapComponent, RouterLink, FormsModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent {

  constructor(
    private router: Router,
    private shareDataService: ShareDataService
  ) { }

  LOGIN_ROUTE = LOGIN_ROUTE;
  SKILLS_FORM = SKILLS_FORM_ROUTE;

  // Definir el objeto de usuario
  userData: userInterface = {
    Name: '',
    Lastname: '',
    email: '',
    cellphone: '',
    personalDescription: '',
    personalSite: '',
    username: ''
  };

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

  // Capturar los datos del mapa
  onAddressSelected(address: addressInterface) {
    this.addressData = address;
  }

  // Método que recoge los datos del formulario
  handleFormSubmit() {

    // Enviar los datos al servicio
    this.shareDataService.setUserData(this.userData);
    this.shareDataService.setAddressData(this.addressData);
    this.shareDataService.setLanguageData(this.languageData);

    // Log de los datos de usuario, dirección y lenguaje
    console.log('User Data:', this.userData);
    console.log('Address Data:', this.addressData);
    console.log('Language Data:', this.languageData);

    // Redirigir al formulario de habilidades
    this.router.navigate([this.SKILLS_FORM]);

  }
}
