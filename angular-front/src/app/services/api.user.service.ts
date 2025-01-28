import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { userInterface } from '../interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private url: string = "http://127.0.0.1:8000/"

  getDataUser(): Observable<userInterface[]> {

    return this.http.get<userInterface[]>(this.url);
  }

  postUserData(newUser: userInterface): Observable<userInterface> {

    return this.http.post<userInterface>(this.url, newUser)
  }

  deleteUserData(userId: number): Observable<userInterface> {

    //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
    return this.http.delete<userInterface>(`${this.url}/${userId}`)
  }

  updateUserData(updateUserData): Observable<userInterface> {

    return this.http.put<userInterface>(`${this.url}/${updateUserData.id}`, updateUserData)
  }


}
