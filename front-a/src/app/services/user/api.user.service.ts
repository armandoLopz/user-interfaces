import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url } from '../../utils/constants';
import { userInterface } from '../../interfaces/interfaces.models';
import { UserDetailsInterface } from '../../interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})
export class ApiUserService {

  constructor(private http: HttpClient) { }

  private url: string = url+"/users/"

  getDataUser(): Observable<userInterface[]> {

    return this.http.get<userInterface[]>(this.url);
  }

  getAllUserDetails(idUser: number): Observable<UserDetailsInterface> {

    const urlQueryIdParam = `${this.url}${idUser}/detail`
    
    return this.http.get<UserDetailsInterface>(urlQueryIdParam);
  }

  postUserData(newUser: userInterface): Observable<userInterface> {

    return this.http.post<userInterface>(this.url, newUser)
  }

  deleteUserData(userId: number): Observable<userInterface> {

    //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
    return this.http.delete<userInterface>(`${this.url}/${userId}`)
  }

  updateUserData(updateUserData: any): Observable<userInterface> {

    return this.http.put<userInterface>(`${this.url}/${updateUserData.id}`, updateUserData)
  }

}