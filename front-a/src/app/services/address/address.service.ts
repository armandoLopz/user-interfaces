import { Injectable } from '@angular/core';
import { url } from '../../utils/constants';
import { addressInterface } from '../../interfaces/interfaces.models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private http: HttpClient) { }

  private url = url+"/addresses/"

  getDataAddress(): Observable<addressInterface[]> {
  
      return this.http.get<addressInterface[]>(this.url);
    }
  
    postAddressData(newAddress: addressInterface): Observable<addressInterface> {
  
      return this.http.post<addressInterface>(this.url, newAddress)
    }
  
    deleteAddressData(addressId: number): Observable<addressInterface> {
  
      //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
      return this.http.delete<addressInterface>(`${this.url}/${addressId}`)
    }
  
    updateAddressData(updateAddressData: any): Observable<addressInterface> {
  
      return this.http.put<addressInterface>(`${this.url}/${updateAddressData.id}`, updateAddressData)
    }
  
}
