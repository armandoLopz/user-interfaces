import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ShareDataService {

  private userIdSource = new BehaviorSubject<number | null>(null);


  // Observables para suscripción
  userData$ = this.userIdSource.asObservable();

  // Métodos para establecer los datos
  setUserData(user: number): void {
    
    this.userIdSource.next(user);
  }

  // Método para obtener todos los datos cuando se necesiten en el componente final
  getAllData() {
    return {
      user: this.userIdSource.value
    };
    
  }
}
