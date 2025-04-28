import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url } from '../../utils/constants';
import { Observable } from 'rxjs';
import { WorkExperienceInterface } from '../../interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})
export class WorkService {

  constructor(private http: HttpClient) { }
  
    private url = url + "/work_experiences/"
  
    getDataWork(): Observable<WorkExperienceInterface[]> {
  
      return this.http.get<WorkExperienceInterface[]>(this.url);
    }
  
    getDataWorkByUserId(userId: number): Observable<WorkExperienceInterface[]> {
  
      const urlQueryParamUserId = `${this.url}?user=${userId}`;    
  
      return this.http.get<WorkExperienceInterface[]>(urlQueryParamUserId);
    }
  
    postWorkData(newWork: WorkExperienceInterface): Observable<WorkExperienceInterface> {
  
      return this.http.post<WorkExperienceInterface>(this.url, newWork)
    }
  
    deleteWorkData(WorkId: number): Observable<WorkExperienceInterface> {
  
      //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
      return this.http.delete<WorkExperienceInterface>(`${this.url}${WorkId}/`)
    }
  
    updateWorkData(updateWorkData: any): Observable<WorkExperienceInterface> {
  
      return this.http.put<WorkExperienceInterface>(`${this.url}${updateWorkData.id}/`, updateWorkData)
    }
  
}
