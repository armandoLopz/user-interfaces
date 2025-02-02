import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PERSONAL_INFO_FORM_ROUTE } from '../../../../app.routes.constans';
import { LOGIN_ROUTE } from '../../../../app.routes.constans';
import { DateFieldsComponent } from '../../../date-fields/date-fields.component';
import { ShareDataService } from '../../../../services/shared-data/share-data.service';

@Component({
  selector: 'app-skills',
  imports: [RouterLink, DateFieldsComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent {

  constructor(
    private shareDataService: ShareDataService
  ) {}

  LOGIN_FORM = LOGIN_ROUTE
  PERSONAL_INFO_FORM = PERSONAL_INFO_FORM_ROUTE

  ngOnInit(): void {
    // Obtener los datos del servicio
    const allData = this.shareDataService.getAllData();
    console.log('All Data:', allData);

    // Aquí puedes proceder con la lógica para enviar estos datos al backend si es necesario
    // Ejemplo: enviar los datos al backend para guardarlos:
    // this.userService.postUserData(allData.user);
    // this.addressService.postAddressData(allData.address);
    // this.languageService.postLanguagesData(allData.language);
  }
}
