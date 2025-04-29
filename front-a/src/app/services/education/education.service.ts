import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url } from '../../utils/constants';
import { Observable } from 'rxjs';
import { educationInterface } from '../../interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})
export class EducationService {

  constructor(private http: HttpClient) { }
  
    private url = url + "/educations/"
  
    getDataAddress(): Observable<educationInterface[]> {
  
      return this.http.get<educationInterface[]>(this.url);
    }
  
    getDataAddressByUserId(userId: number): Observable<educationInterface[]> {
  
      const urlQueryParamUserId = `${this.url}?user=${userId}/`;
  
    
      return this.http.get<educationInterface[]>(urlQueryParamUserId);
    }
  
    postAddressData(newAddress: educationInterface): Observable<educationInterface> {
  
      return this.http.post<educationInterface>(this.url, newAddress)
    }
  
    deleteAddressData(addressId: number): Observable<educationInterface> {
  
      //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
      return this.http.delete<educationInterface>(`${this.url}${addressId}/`)
    }
  
    updateAddressData(updateAddressData: any): Observable<educationInterface> {
  
      return this.http.put<educationInterface>(`${this.url}${updateAddressData.id}/`, updateAddressData)
    }
}
