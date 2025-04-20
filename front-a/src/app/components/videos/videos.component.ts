import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for @if etc.
import { VideoInterface } from '../../interfaces/interfaces.models'; // Importa tu interfaz
import { VideoService } from '../../services/multimedia/video.service'; // Importa tu servicio
import { Subscription } from 'rxjs'; // Importa Subscription para gestionar la suscripción

@Component({
  selector: 'app-videos',
  standalone: true,
  // Asegúrate que CommonModule y ReactiveFormsModule estén importados
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './videos.component.html',
  styleUrls: [] // Añade styleUrls si tienes estilos específicos
})
export class VideosComponent implements OnInit, OnDestroy {

  // Propiedades para el formulario reactivo
  videoForm!: FormGroup;

  // Propiedades para manejar los archivos seleccionados
  currentVideoFile: File | null = null;
  subtitleESFile: File | null = null;
  subtitleENFile: File | null = null;

  // Propiedades para manejar las URLs de previsualización (usan URL.createObjectURL)
  // Deben limpiarse con URL.revokeObjectURL() para liberar memoria
  videoUrl: string | null = null; // URL para la previsualización del video
  subtitleESUrl: string | null = null; // URL para la previsualización del subtítulo ES
  subtitleENUrl: string | null = null; // URL para la previsualización del subtítulo EN


  // >>> Propiedades de estado para la UI - SOLUCIONAN LOS ERRORES DEL HTML <<<
  isLoading: boolean = false; // Indicador de carga (para deshabilitar el botón, mostrar spinner)
  videoError: string | null = null; // Mensaje de error (lo usas en el HTML)
  uploadSuccessMessage: string | null = null; // Mensaje de éxito (lo usas en el HTML)


  // Propiedades para el reproductor de previsualización
  selectedSubtitle: 'en' | 'es' = 'en'; // Para controlar qué subtítulo mostrar en la previsualización

  private readonly MAX_VIDEO_SIZE = 52428800; // 50MB in bytes
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
  private readonly ALLOWED_SUBTITLE_EXTENSIONS = ['.vtt', '.srt'];

  // Store object URLs to revoke them later - Mejor usar este array
  private objectUrls: string[] = [];


  // >>> Referencias a elementos del DOM usando @ViewChild <<<
  // Asegúrate de que los template reference variables (#...) en el HTML coincidan
  @ViewChild('videoFileInput') videoFileInput!: ElementRef<HTMLInputElement>; // Referencia al input file de video
  @ViewChild('subtitleEsInput') subtitleEsInput!: ElementRef<HTMLInputElement>; // Referencia al input file de subtítulos ES
  @ViewChild('subtitleEnInput') subtitleEnInput!: ElementRef<HTMLInputElement>; // Referencia al input file de subtítulos EN

  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>; // Referencia al elemento <video> de previsualización
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>; // Referencia al elemento <video> del reproductor con subtítulos


  // >>> Suscripción para gestionar la llamada al servicio <<<
  private uploadSubscription: Subscription | null = null; // Para gestionar la suscripción a la carga y evitar memory leaks


  constructor(
    private fb: FormBuilder, // Inyecta FormBuilder para trabajar con formularios reactivos
    private videoService: VideoService // >>> Inyecta tu servicio de video <<<
  ) {
    // Inicializa el formulario en el constructor o en ngOnInit
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
      // Nota: File inputs no son parte del form group directamente típicamente
    });
  }

  ngOnInit(): void {
    // Detectar idioma del navegador y establecer idioma de subtítulos por defecto
    this.detectBrowserLanguage();
  }

  ngOnDestroy(): void {
    // Limpieza de suscripciones al destruir el componente para evitar memory leaks
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
    // Limpieza crucial: Revocar *todas* las Object URLs creadas
    this.revokeAllObjectUrls();
  }

  private detectBrowserLanguage(): void {
    try {
      const browserLang = navigator.language?.toLowerCase() || 'en'; // Default to 'en' if undefined
      this.selectedSubtitle = browserLang.startsWith('es') ? 'es' : 'en';
    } catch (error) {
      console.warn('Could not detect browser language, defaulting to English.', error);
      this.selectedSubtitle = 'en';
    }
  }

  // Helper para crear y trackear URLs para revocarlas después
  private createAndTrackUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.objectUrls.push(url); // Añade la URL al array de seguimiento
    return url;
  }

   // Helper para revocar una URL específica y removerla del tracking
   private revokeUrl(url: string | null): void {
       if (url) {
           const index = this.objectUrls.indexOf(url);
           if (index > -1) {
               URL.revokeObjectURL(url);
               this.objectUrls.splice(index, 1); // Elimina del array de seguimiento
           }
       }
   }

   // Helper para revocar todas las URLs trackeadas
   private revokeAllObjectUrls(): void {
       console.log(`Revocando ${this.objectUrls.length} object URLs.`);
       this.objectUrls.forEach(url => URL.revokeObjectURL(url));
       this.objectUrls = []; // Limpia el array de seguimiento
   }


  // Método para manejar la selección del archivo de video
  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null; // Limpiar errores anteriores
    this.uploadSuccessMessage = null; // Limpiar mensaje de éxito anterior

    if (!input.files || input.files.length === 0) {
      this.currentVideoFile = null;
      this.revokeUrl(this.videoUrl); // Revocar URL anterior
      this.videoUrl = null;
      this.clearPlayer(); // Limpiar reproductores si se deselecciona el archivo
      return;
    }

    const file = input.files[0];

    // Validar tipo de archivo
    if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      this.videoError = `Invalid video format. Only ${this.ALLOWED_VIDEO_TYPES.join(', ')} formats are allowed. Found: ${file.type || 'unknown'}`;
      input.value = ''; // Limpiar el input file
      this.currentVideoFile = null;
      this.revokeUrl(this.videoUrl); // Revocar URL anterior
      this.videoUrl = null;
      this.clearPlayer();
      return;
    }

    // Validar tamaño del archivo
    if (file.size > this.MAX_VIDEO_SIZE) {
      this.videoError = `Video file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 50MB.`;
      input.value = ''; // Limpiar el input file
      this.currentVideoFile = null;
      this.revokeUrl(this.videoUrl); // Revocar URL anterior
      this.videoUrl = null;
      this.clearPlayer();
      return;
    }

    // Archivo válido
    this.currentVideoFile = file;

    // Crear y trackear una nueva URL para la previsualización del video
    this.revokeUrl(this.videoUrl); // Revocar URL previa si existe
    this.videoUrl = this.createAndTrackUrl(file);

    // Asignar la URL al elemento de previsualización
    setTimeout(() => { // Usamos setTimeout para asegurar que la vista se ha actualizado
      if (this.videoPreview?.nativeElement && this.videoUrl) {
        this.videoPreview.nativeElement.src = this.videoUrl;
        this.videoPreview.nativeElement.load(); // Cargar el video en el elemento
      }
       // Si también se usa videoPlayer para previsualización del video base
       if (this.videoPlayer?.nativeElement && this.videoUrl) {
            // No revocar aquí, ya que updateVideoPlayer lo hará si es necesario
            this.updateVideoPlayer(); // Actualizar el reproductor principal
       }
    });
  }

  // Método para manejar la selección del archivo de subtítulos ES
  onSubtitleESChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null; // Limpiar errores anteriores
    this.uploadSuccessMessage = null; // Limpiar mensaje de éxito anterior

     if (!input.files || input.files.length === 0) {
      this.subtitleESFile = null;
      this.revokeUrl(this.subtitleESUrl);
      this.subtitleESUrl = null;
      this.updateVideoPlayer(); // Actualizar reproductor sin este subtítulo
      return;
    }

    const file = input.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    // Validar formato del subtítulo
    if (!this.ALLOWED_SUBTITLE_EXTENSIONS.includes(fileExtension)) {
      this.videoError = `Invalid Spanish subtitle format. Only ${this.ALLOWED_SUBTITLE_EXTENSIONS.join(', ')} formats are allowed. Found: ${fileExtension}`;
      input.value = ''; // Limpiar el input file
      this.subtitleESFile = null;
      this.revokeUrl(this.subtitleESUrl);
      this.subtitleESUrl = null;
      this.updateVideoPlayer();
      return; // Detener procesamiento
    }

    // TODO: Opcional - Validación más robusta del contenido del archivo SRT/VTT
    // (Puede ser compleja y asíncrona, considera hacerlo en el backend)

    // Archivo válido
    this.subtitleESFile = file;
    this.revokeUrl(this.subtitleESUrl); // Revocar URL previa
    this.subtitleESUrl = this.createAndTrackUrl(file); // Crear y trackear nueva URL

    console.log(`Subtítulo ES seleccionado. URL de objeto: ${this.subtitleESUrl}`);

    // Actualizar el reproductor principal para incluir/cambiar este subtítulo
    this.updateVideoPlayer();
  }

  // Método para manejar la selección del archivo de subtítulos EN
  onSubtitleENChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null; // Limpiar errores anteriores
    this.uploadSuccessMessage = null; // Limpiar mensaje de éxito anterior

    if (!input.files || input.files.length === 0) {
      this.subtitleENFile = null;
      this.revokeUrl(this.subtitleENUrl);
      this.subtitleENUrl = null;
       this.updateVideoPlayer(); // Actualizar reproductor sin este subtítulo
      return;
    }

    const file = input.files[0];
     const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    // Validar formato del subtítulo
    if (!this.ALLOWED_SUBTITLE_EXTENSIONS.includes(fileExtension)) {
      this.videoError = `Invalid English subtitle format. Only ${this.ALLOWED_SUBTITLE_EXTENSIONS.join(', ')} formats are allowed. Found: ${fileExtension}`;
      input.value = ''; // Limpiar el input file
      this.subtitleENFile = null;
       this.revokeUrl(this.subtitleENUrl);
      this.subtitleENUrl = null;
      this.updateVideoPlayer();
      return; // Detener procesamiento
    }

     // TODO: Opcional - Validación más robusta del contenido del archivo SRT/VTT


    // Archivo válido
    this.subtitleENFile = file;
    this.revokeUrl(this.subtitleENUrl); // Revocar URL previa
    this.subtitleENUrl = this.createAndTrackUrl(file); // Crear y trackear nueva URL

    console.log(`Subtítulo EN seleccionado. URL de objeto: ${this.subtitleENUrl}`);

     // Actualizar el reproductor principal para incluir/cambiar este subtítulo
    this.updateVideoPlayer();
  }


  // Método para cambiar el idioma de subtítulos en la previsualización
  changeSubtitleLanguage(lang: 'en' | 'es'): void {
    if (this.selectedSubtitle !== lang) {
      this.selectedSubtitle = lang;
      // Llama a updateVideoPlayer para que añada/cambie la pista de subtítulo
      this.updateVideoPlayer();
    }
  }


  // Método para actualizar el reproductor principal con video y subtítulos
  private updateVideoPlayer(): void {
     // Usamos setTimeout para asegurar que los elementos @ViewChild estén listos y la UI actualizada
    setTimeout(() => {
      const video = this.videoPlayer?.nativeElement;

      if (!video || !this.videoUrl) {
        // Si no hay elemento videoPlayer o no hay URL de video, limpiar y salir
        this.clearPlayer();
        return;
      }

      // Preservar estado de reproducción si es posible
      const currentTime = video.currentTime;
      const isPaused = video.paused;

      // Si la fuente del video ha cambiado, asignarla
      if (video.currentSrc !== this.videoUrl) {
          // No revocar la URL del video aquí, ya se hace en onVideoFileChange o ngOnDestroy
          video.src = this.videoUrl;
      }

      // Limpiar tracks de subtítulos existentes antes de añadir nuevos
      // Es importante iterar hacia atrás si eliminas elementos de una lista "viva" como video.textTracks
      const tracks = video.textTracks;
      for (let i = tracks.length - 1; i >= 0; i--) {
           // Es mejor manipular los nodos <track> en el DOM, no la lista TextTrackList directamente para consistencia
           // video.removeChild(tracks[i]); // Esto puede no funcionar correctamente con todos los navegadores
           // Alternativa: remover los elementos <track> del DOM
      }
       // Remover explicitamente los elementos <track> del DOM si existen como hijos del <video>
       while(video.firstChild){
           if(video.firstChild.nodeName === 'TRACK'){
               video.removeChild(video.firstChild);
           } else {
               // Romper si encontramos algo que no sea un track (ej: source), aunque idealmente <video> solo debería tener <source> y <track>
               break;
           }
       }


      // Añadir la pista de subtítulo seleccionada si existe su URL
      const subtitleUrlToAdd = this.selectedSubtitle === 'en' ? this.subtitleENUrl : this.subtitleESUrl;
      const subtitleLangToAdd = this.selectedSubtitle;
      const subtitleLabelToAdd = this.selectedSubtitle === 'en' ? 'English' : 'Spanish';

      if (subtitleUrlToAdd) {
        const trackElement = document.createElement('track');
        trackElement.kind = 'subtitles';
        trackElement.src = subtitleUrlToAdd;
        trackElement.srclang = subtitleLangToAdd;
        trackElement.label = subtitleLabelToAdd;
        trackElement.default = true; // Intenta hacerla la pista por defecto
        video.appendChild(trackElement); // Añade el elemento track al video
      }

      // Cargar el video para aplicar los cambios (nueva fuente, nuevos tracks)
      video.load();

      // Intentar restaurar el tiempo de reproducción y el estado de pausa después de cargar
      // Usar el evento 'loadedmetadata' asegura que el video esté listo
      video.onloadedmetadata = () => {
          video.currentTime = currentTime;
          if (!isPaused) {
              // Intenta reproducir, maneja la promesa devuelta por .play()
              video.play().catch(e => console.error("Error trying to resume playback:", e));
          }
           // Asegurarse de que la pista correcta esté visible después de cargar
           for (let i = 0; i < video.textTracks.length; i++) {
               const track = video.textTracks[i];
                // Nota: track.language a veces es diferente a track.srclang dependiendo del navegador y archivo VTT
                // Usa track.label o una combinación para encontrar la pista correcta
                if (track.kind === 'subtitles' && track.language === subtitleLangToAdd) {
                    track.mode = 'showing'; // Mostrar la pista seleccionada
                } else if (track.kind === 'subtitles') {
                     track.mode = 'hidden'; // Ocultar otras pistas de subtítulos
                }
           }
           // Remover el listener para evitar que se dispare en futuros eventos load
           video.onloadedmetadata = null;
      };
      // Manejar errores de carga si ocurren
       video.onerror = () => {
           this.videoError = 'Error loading video or subtitles for preview.';
            this.clearPlayer(); // Limpiar reproductor en caso de error
             video.onerror = null; // Remover listener
       };


    }); // Fin del setTimeout
  }

  // Método para limpiar completamente el reproductor de video
  private clearPlayer(): void {
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.pause();
      video.removeAttribute('src'); // Elimina el atributo src (más robusto que video.src = '')
      video.load(); // Cargar para que el cambio surta efecto y se restablezca
      // Eliminar todos los elementos <track> hijos
       while(video.firstChild){
           if(video.firstChild.nodeName === 'TRACK'){
               video.removeChild(video.firstChild);
           } else {
               // Romper si encontramos algo que no sea un track
               break;
           }
       }
        // Asegurarse de revocar la URL del video si era una Object URL
       if (this.videoUrl) {
            this.revokeUrl(this.videoUrl); // Revocar la URL del video principal
            this.videoUrl = null; // Limpiar la propiedad
       }
         // Las URLs de subtítulos ya se limpian en onSubtitle...Change o ngOnDestroy
    }
     // También limpiar la previsualización pequeña si existe
      if (this.videoPreview?.nativeElement) {
           if (this.videoPreview.nativeElement.src) URL.revokeObjectURL(this.videoPreview.nativeElement.src);
           this.videoPreview.nativeElement.src = '';
           this.videoPreview.nativeElement.load();
      }
  }


  // >>> Método llamado al enviar el formulario - INTEGRACIÓN DEL SERVICIO <<<
  onSubmitVideo(): void {
    // 1. Validar formulario y archivos
    if (this.videoForm.invalid) {
      this.videoError = 'Por favor, completa correctamente el título y la descripción.';
      // Marcar todos los campos como tocados para mostrar mensajes de validación
      Object.values(this.videoForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.uploadSuccessMessage = null; // Asegurar que no haya mensaje de éxito
      return; // Detener el envío
    }

    // Validar que los archivos obligatorios estén seleccionados
    if (!this.currentVideoFile) {
      this.videoError = 'Por favor, selecciona un archivo de video.';
      this.uploadSuccessMessage = null;
      return;
    }
    if (!this.subtitleENFile) {
      this.videoError = 'Por favor, carga el archivo de subtítulos en inglés (.vtt o .srt).';
      this.uploadSuccessMessage = null;
      return;
    }
    if (!this.subtitleESFile) {
      this.videoError = 'Por favor, carga el archivo de subtítulos en español (.vtt o .srt).';
      this.uploadSuccessMessage = null;
      return;
    }

    // Limpiar mensajes de estado anteriores antes de iniciar la carga
    this.videoError = null;
    this.uploadSuccessMessage = null;
    this.isLoading = true; // Activar indicador de carga

    // 2. Crear el objeto FormData
    const formData = new FormData();
    // Añadir datos del formulario
    formData.append('title', this.videoForm.get('title')?.value);
    formData.append('description', this.videoForm.get('description')?.value);
    // Añadir archivos - Asegúrate que los nombres ('video', 'subtitle_es', 'subtitle_en') coincidan con los esperados por tu API
    formData.append('video_file', this.currentVideoFile, this.currentVideoFile.name);
    formData.append('subtitle_spanish', this.subtitleESFile, this.subtitleESFile.name);
    formData.append('subtitle_english', this.subtitleENFile, this.subtitleENFile.name);


    // 3. Llamar al servicio para subir el video
    // Gestionar la suscripción
    this.uploadSubscription = this.videoService.uploadVideo(formData).subscribe({
      next: (response: VideoInterface) => {
        // *** Lógica para después del éxito ***
        console.log('Video subido exitosamente:', response);

        this.uploadSuccessMessage = '¡Video subido correctamente!'; // Establecer el mensaje de éxito
        this.videoError = null; // Asegurar que no haya error visible
        this.isLoading = false; // Desactivar indicador de carga

        // Limpiar el formulario y los archivos seleccionados
        this.resetForm();

        // Opcional: Puedes hacer algo más aquí, como redirigir al usuario
      },
      error: (error: any) => {
        // *** Lógica para manejar el error ***
        console.error('Error subiendo video:', error);
        // Mostrar el mensaje de error recibido del servicio (el servicio ya formatea un mensaje útil)
        this.videoError = `Error al subir video: ${error.message || 'Ocurrió un error desconocido durante la carga.'}`;
        this.uploadSuccessMessage = null; // Asegurar que no haya mensaje de éxito
        this.isLoading = false; // Desactivar indicador de carga
        // No limpiar el formulario en caso de error, para que el usuario pueda corregir los datos si es necesario
      }
    });
  }


  // Método para resetear completamente el estado del formulario y archivos
  resetForm(): void {
      // Resetear controles del formulario reactivo
      this.videoForm.reset();

      // Limpiar los inputs de archivo nativos usando ViewChild
      if (this.videoFileInput) {
        this.videoFileInput.nativeElement.value = '';
      }
      if (this.subtitleEsInput) {
        this.subtitleEsInput.nativeElement.value = '';
      }
      if (this.subtitleEnInput) {
        this.subtitleEnInput.nativeElement.value = '';
      }

      // Limpiar las variables del componente que guardan los archivos
      this.currentVideoFile = null;
      this.subtitleENFile = null;
      this.subtitleESFile = null;

      // Limpiar mensajes de estado
      this.videoError = null;
      // Mantener el mensaje de éxito *después* del reseteo si se llama por éxito,
      // o limpiarlo si se llama por otra razón (aunque actualmente solo se llama por éxito)
      // this.uploadSuccessMessage = null; // Si quieres que el mensaje desaparezca al resetear

      // Limpiar previsualizaciones y revocar todas las Object URLs
      this.clearPlayer(); // Esto ya limpia el videoUrl y subtitulosUrls y revoca sus URLs
      this.revokeAllObjectUrls(); // Asegura que cualquier URL remanente sea revocada

      // Resetear selección de subtítulos para el reproductor
      this.detectBrowserLanguage(); // O simplemente this.selectedSubtitle = 'en';
  }

  // --- Métodos de utilidad para Object URLs (ya los tenías, los adapté) ---

  // (Los métodos createAndTrackUrl, revokeUrl, revokeAllObjectUrls ya están definidos arriba)
  // ... (código de esos métodos) ...

}