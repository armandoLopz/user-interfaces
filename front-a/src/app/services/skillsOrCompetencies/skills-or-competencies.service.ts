import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { skillsOrCompetenciesInterface } from '../../interfaces/interfaces.models';
import { url } from '../../utils/constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SkillsOrCompetenciesService {

  constructor(private http: HttpClient) { }

  private urlSkills: string = url+"/skills"
  private urlCompetencies: string = url+"/competencies/"
  
  //SKILLS SERVICE
  getSkillsDara(): Observable<skillsOrCompetenciesInterface[]> {
  
      return this.http.get<skillsOrCompetenciesInterface[]>(this.urlSkills);
    }
  
    postSkillData(newSkill: skillsOrCompetenciesInterface): Observable<skillsOrCompetenciesInterface> {
  
      return this.http.post<skillsOrCompetenciesInterface>(this.urlSkills, newSkill)
    }
  
    deleteSkillData(skillId: number): Observable<skillsOrCompetenciesInterface> {
  
      //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
      return this.http.delete<skillsOrCompetenciesInterface>(`${this.urlSkills}/${skillId}`)
    }
  
    updateSkillData(updateSkillData: any): Observable<skillsOrCompetenciesInterface> {
  
      return this.http.put<skillsOrCompetenciesInterface>(`${this.urlSkills}/${updateSkillData.id}`,updateSkillData)
    }


    //COMPETENCIES SERVICE

    getDataCompetencie(): Observable<skillsOrCompetenciesInterface[]> {
    
        return this.http.get<skillsOrCompetenciesInterface[]>(this.urlCompetencies);
      }
    
      postCompetencieData(newCompetencie: skillsOrCompetenciesInterface): Observable<skillsOrCompetenciesInterface> {
    
        return this.http.post<skillsOrCompetenciesInterface>(this.urlCompetencies, newCompetencie)
      }
    
      deleteCompetencieData(competencieId: number): Observable<skillsOrCompetenciesInterface> {
    
        //PROBABLY CAN U¿I CHANGE THIS RETURN TYPE
        return this.http.delete<skillsOrCompetenciesInterface>(`${this.urlCompetencies}/${competencieId}`)
      }
    
      updateCompetencieData(updateCompetencieData: any): Observable<skillsOrCompetenciesInterface> {
    
        return this.http.put<skillsOrCompetenciesInterface>(`${this.urlCompetencies}/${updateCompetencieData.id}`, updateCompetencieData)
      }
    
  
}
