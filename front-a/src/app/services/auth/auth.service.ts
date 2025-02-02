import { Injectable } from '@angular/core';
import { url } from '../../utils/constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { userAuth } from '../../interfaces/interfaces.models';
import { tokenRequest } from '../../interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient) { }

  private url: string = url

  login(userData: userAuth): Observable<tokenRequest>{

    const apiAuthUrl = `${this.url}/api/token/`;
    
    return this.http.post<tokenRequest>( apiAuthUrl, userData);
  }
}
