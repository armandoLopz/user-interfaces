import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { url } from '../../utils/constants';
import { ImageInterface } from '../../interfaces/interfaces.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }

  private url: string = url + "/image/"
  getAllimages(): Observable<ImageInterface[]> {
    return this.http.get<ImageInterface[]>(this.url);
  }
  postimage(newimage: ImageInterface): Observable<ImageInterface> {
    return this.http.post<ImageInterface>(this.url, newimage)
  }
  deleteimage(imageId: number): Observable<ImageInterface> {

    return this.http.delete<ImageInterface>(`${this.url}/${imageId}`)
  }
  updateimage(imageUpdate: ImageInterface): Observable<ImageInterface> {
    return this.http.put<ImageInterface>(`${this.url}/${imageUpdate.id}`, imageUpdate)
  }

}
