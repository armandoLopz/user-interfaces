import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { url } from '../../utils/constants';
import { VideoInterface } from '../../interfaces/interfaces.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient) { }

  private url: string = url + "/video/"

  getAllVideos(): Observable<VideoInterface[]> {
    return this.http.get<VideoInterface[]>(this.url);
  }

  postVideo(newVideo: VideoInterface): Observable<VideoInterface> {
    return this.http.post<VideoInterface>(this.url, newVideo)
  }

  deleteVideo(videoId: number): Observable<VideoInterface> {
    
    return this.http.delete<VideoInterface>(`${this.url}/${videoId}`)
  }

  updateVideo(videoUpdate: VideoInterface): Observable<VideoInterface> {

    return this.http.put<VideoInterface>(`${this.url}/${videoUpdate.id}`, videoUpdate)
  }
}
