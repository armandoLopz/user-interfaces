import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { url } from '../../utils/constants'; // Asegúrate que esta ruta sea correcta
import { VideoInterface } from '../../interfaces/interfaces.models'; // Asegúrate que esta ruta sea correcta
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient) { }

  // Ajusta la URL base si es necesario. Quitamos la '/' final aquí
  // para añadirla específicamente en cada método y evitar '//'
  private baseUrl: string = url + "/videos";

  getAllVideos(): Observable<VideoInterface[]> {
    return this.http.get<VideoInterface[]>(`${this.baseUrl}/`).pipe(
        catchError(this.handleError)
    );
  }

  // Este método asume que el backend espera un JSON puro
  // Podría ser útil para actualizaciones de metadatos sin archivos
  postVideoMetadata(newVideo: VideoInterface): Observable<VideoInterface> {
    return this.http.post<VideoInterface>(`${this.baseUrl}/`, newVideo).pipe(
        catchError(this.handleError)
    );
  }

  // --- NUEVO MÉTODO para subir archivos con FormData ---
  // Asume que el endpoint POST en `${this.baseUrl}/` acepta multipart/form-data
  // y devuelve el objeto VideoInterface creado (con las URLs/paths como strings)
  uploadVideo(formData: FormData): Observable<VideoInterface> {
    // Angular HttpClient detecta FormData y establece Content-Type automáticamente.
    // ¡NO establezcas manualmente el header Content-Type!
    return this.http.post<VideoInterface>(`${this.baseUrl}/`, formData).pipe(
        catchError(this.handleError) // Añadir manejo de errores
    );
  }
  // ----------------------------------------------------

  deleteVideo(videoId: number): Observable<any> { // Delete a menudo no devuelve cuerpo
     // Asegúrate que videoId es un número válido
     if (isNaN(videoId) || videoId <= 0) {
        return throwError(() => new Error('Invalid Video ID for delete operation'));
     }
    return this.http.delete<any>(`${this.baseUrl}/${videoId}`).pipe(
        catchError(this.handleError)
    );
  }

  updateVideo(videoUpdate: VideoInterface): Observable<VideoInterface> {
     // Asegúrate que videoUpdate.id existe y es válido
    if (!videoUpdate.id || isNaN(videoUpdate.id) || videoUpdate.id <= 0) {
        return throwError(() => new Error('Invalid Video ID for update operation'));
    }
    // Este PUT probablemente espera JSON, no FormData
    return this.http.put<VideoInterface>(`${this.baseUrl}/${videoUpdate.id}`, videoUpdate).pipe(
        catchError(this.handleError)
    );
  }

  // Helper simple para manejo de errores
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
       if (error.error && typeof error.error === 'string') {
           errorMessage += `\nServer Message: ${error.error}`;
       } else if (error.error && error.error.message) {
            errorMessage += `\nServer Message: ${error.error.message}`;
       }
    }
    // Podrías usar un servicio de logging o mostrar un mensaje más amigable al usuario
    return throwError(() => new Error(errorMessage));
  }
}