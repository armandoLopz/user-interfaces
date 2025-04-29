import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url } from '../../utils/constants';
import { LanguageInterface } from '../../interfaces/interfaces.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private http: HttpClient) { }

  private url: string = url + "/languages/"

  getDataLanguages(): Observable<LanguageInterface[]> {

    return this.http.get<LanguageInterface[]>(this.url);
  }

  postLanguagesData(newAddress: LanguageInterface): Observable<LanguageInterface> {

    return this.http.post<LanguageInterface>(this.url, newAddress)
  }

  deleteLanguagesData(addressId: number): Observable<LanguageInterface> {

    //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
    return this.http.delete<LanguageInterface>(`${this.url}${addressId}/`)
  }

  updateLanguagesData(updateLanguagesData: any): Observable<LanguageInterface> {

    return this.http.put<LanguageInterface>(`${this.url}${updateLanguagesData.id}/`, updateLanguagesData)
  }
}
