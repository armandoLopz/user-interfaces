import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { userInterface, addressInterface, LanguageInterface } from '../../interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})

export class ShareDataService {

  private userDataSource = new BehaviorSubject<userInterface | null>(null);
  private addressDataSource = new BehaviorSubject<addressInterface | null>(null);
  private languageDataSource = new BehaviorSubject<LanguageInterface | null>(null);

  // Observables para suscripción
  userData$ = this.userDataSource.asObservable();
  addressData$ = this.addressDataSource.asObservable();
  languageData$ = this.languageDataSource.asObservable();

  // Métodos para establecer los datos
  setUserData(user: userInterface): void {
    this.userDataSource.next(user);
  }

  setAddressData(address: addressInterface): void {
    this.addressDataSource.next(address);
  }

  setLanguageData(language: LanguageInterface): void {
    this.languageDataSource.next(language);
  }

  // Método para obtener todos los datos cuando se necesiten en el componente final
  getAllData() {
    return {
      user: this.userDataSource.value,
      address: this.addressDataSource.value,
      language: this.languageDataSource.value
    };
  }
}
