import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { url } from "../../utils/constants";

@Injectable({
  providedIn: 'root'
})
export class GenericService<T> {
  constructor(private http: HttpClient) { }

  private url: string = url
  private urlComplete: string = ''
  getAll(urlArgument: string): Observable<T[]> {

    this.urlComplete= this.url+urlArgument
    
    return this.http.get<T[]>(this.urlComplete);
  }

  getOne(urlArgument: string, id: number): Observable<T> {

    this.urlComplete= this.url+urlArgument

    return this.http.get<T>(`${this.urlComplete}/${id}/`);
  }

  getByUserId(urlArgument: string, id: number): Observable<T> {

    this.urlComplete= this.url+urlArgument

    return this.http.get<T>(`${this.urlComplete}/?user=${id}`);
  }

  create(urlArgument: string, data: T): Observable<T> {
    
    this.urlComplete= this.url+urlArgument

    return this.http.post<T>(this.urlComplete, data);
  }

  delete(urlArgument: string, deleteOBjectId: number): Observable<T> {

    this.urlComplete= this.url+urlArgument
    //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
    return this.http.delete<T>(`${this.urlComplete}${deleteOBjectId}/`)
  }

  update(urlArgument: string, updateObjectData: T, updateObjectId: number): Observable<T> {

    this.url = this.url+urlArgument
  
    return this.http.put<T>(`${this.url}/${updateObjectId}/`, updateObjectData)
  }
}
