import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VideoInterface } from '../../interfaces/interfaces.models';
import { VideoService } from '../../services/multimedia/video.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './videos.component.html',
  styleUrls: [] // Añade styleUrls si tienes estilos específicos
})
export class VideosComponent implements OnInit, OnDestroy {

  videoForm!: FormGroup;
  currentVideoFile: File | null = null;
  subtitleESFile: File | null = null;
  subtitleENFile: File | null = null;

  videoUrl: string | null = null;
  subtitleESUrl: string | null = null;
  subtitleENUrl: string | null = null;

  isLoading: boolean = false;
  videoError: string | null = null;
  uploadSuccessMessage: string | null = null;

  // Controla qué subtítulo está seleccionado para la *interfaz de usuario* (botones)
  selectedSubtitle: 'en' | 'es' = 'en';
  // Almacena el idioma detectado para establecer el subtítulo por defecto
  private browserDetectedLanguage: 'en' | 'es' = 'en'; // Valor por defecto

  private readonly MAX_VIDEO_SIZE = 52428800; // 50MB
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
  private readonly ALLOWED_SUBTITLE_EXTENSIONS = ['.vtt', '.srt'];
  private objectUrls: string[] = [];

  @ViewChild('videoFileInput') videoFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('subtitleEsInput') subtitleEsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('subtitleEnInput') subtitleEnInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  private uploadSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService
  ) {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Detectar idioma del navegador y establecer idioma de subtítulos por defecto
    this.detectBrowserLanguage();
  }

  ngOnDestroy(): void {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
    this.revokeAllObjectUrls();
  }

  // --- NUEVO: Detecta y almacena el idioma preferido ---
  private detectBrowserLanguage(): void {
    try {
      // Usa navigator.language o navigator.languages[0]
      const browserLang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
      // Simplifica: si empieza con 'es', es español; si no, inglés como fallback
      this.browserDetectedLanguage = browserLang.startsWith('es') ? 'es' : 'en';
      // Establece también el estado inicial del botón seleccionado
      this.selectedSubtitle = this.browserDetectedLanguage;
      console.log(`Browser language detected: ${browserLang}, Default subtitle set to: ${this.browserDetectedLanguage}`);
    } catch (error) {
      console.warn('Could not detect browser language, defaulting to English.', error);
      this.browserDetectedLanguage = 'en';
      this.selectedSubtitle = 'en';
    }
  }

  private createAndTrackUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.objectUrls.push(url);
    return url;
  }

  private revokeUrl(url: string | null): void {
    if (url) {
      const index = this.objectUrls.indexOf(url);
      if (index > -1) {
        URL.revokeObjectURL(url);
        this.objectUrls.splice(index, 1);
      }
    }
  }

  private revokeAllObjectUrls(): void {
    console.log(`Revoking ${this.objectUrls.length} object URLs.`);
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];
  }

  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null;
    this.uploadSuccessMessage = null;

    if (!input.files || input.files.length === 0) {
      this.revokeUrl(this.videoUrl);
      this.videoUrl = null;
      this.currentVideoFile = null;
      this.clearPlayer(); // Limpia ambos reproductores
      return;
    }

    const file = input.files[0];

    if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      this.videoError = `Invalid video format. Allowed: ${this.ALLOWED_VIDEO_TYPES.join(', ')}. Found: ${file.type || 'unknown'}`;
      input.value = '';
      this.revokeUrl(this.videoUrl);
      this.videoUrl = null;
      this.currentVideoFile = null;
      this.clearPlayer();
      return;
    }

    if (file.size > this.MAX_VIDEO_SIZE) {
      this.videoError = `Video too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max: 50MB.`;
      input.value = '';
      this.revokeUrl(this.videoUrl);
      this.videoUrl = null;
      this.currentVideoFile = null;
      this.clearPlayer();
      return;
    }

    this.currentVideoFile = file;
    this.revokeUrl(this.videoUrl);
    this.videoUrl = this.createAndTrackUrl(file);

    // Actualizar *ambos* reproductores si es necesario
    setTimeout(() => {
      if (this.videoPreview?.nativeElement && this.videoUrl) {
        this.videoPreview.nativeElement.src = this.videoUrl;
        this.videoPreview.nativeElement.load();
      }
      // Actualiza el reproductor principal (esto añadirá subtítulos si ya están seleccionados)
      this.updateVideoPlayer();
    });
  }

  onSubtitleESChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null;
    this.uploadSuccessMessage = null;

    if (!input.files || input.files.length === 0) {
      this.revokeUrl(this.subtitleESUrl);
      this.subtitleESUrl = null;
      this.subtitleESFile = null;
      this.updateVideoPlayer(); // Actualiza el reproductor sin este subtítulo
      return;
    }

    const file = input.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!this.ALLOWED_SUBTITLE_EXTENSIONS.includes(fileExtension)) {
      this.videoError = `Invalid Spanish subtitle format. Allowed: ${this.ALLOWED_SUBTITLE_EXTENSIONS.join(', ')}. Found: ${fileExtension}`;
      input.value = '';
      this.revokeUrl(this.subtitleESUrl);
      this.subtitleESUrl = null;
      this.subtitleESFile = null;
      this.updateVideoPlayer();
      return;
    }

    this.subtitleESFile = file;
    this.revokeUrl(this.subtitleESUrl);
    this.subtitleESUrl = this.createAndTrackUrl(file);
    console.log(`Spanish subtitle selected. Object URL: ${this.subtitleESUrl}`);
    this.updateVideoPlayer(); // Actualiza el reproductor con el nuevo subtítulo
  }

  onSubtitleENChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null;
    this.uploadSuccessMessage = null;

     if (!input.files || input.files.length === 0) {
      this.revokeUrl(this.subtitleENUrl);
      this.subtitleENUrl = null;
      this.subtitleENFile = null;
      this.updateVideoPlayer(); // Actualiza el reproductor sin este subtítulo
      return;
    }

    const file = input.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!this.ALLOWED_SUBTITLE_EXTENSIONS.includes(fileExtension)) {
      this.videoError = `Invalid English subtitle format. Allowed: ${this.ALLOWED_SUBTITLE_EXTENSIONS.join(', ')}. Found: ${fileExtension}`;
      input.value = '';
      this.revokeUrl(this.subtitleENUrl);
      this.subtitleENUrl = null;
      this.subtitleENFile = null;
      this.updateVideoPlayer();
      return;
    }

    this.subtitleENFile = file;
    this.revokeUrl(this.subtitleENUrl);
    this.subtitleENUrl = this.createAndTrackUrl(file);
    console.log(`English subtitle selected. Object URL: ${this.subtitleENUrl}`);
    this.updateVideoPlayer(); // Actualiza el reproductor con el nuevo subtítulo
  }

  // --- MODIFICADO: Cambia el modo de la pista directamente ---
  changeSubtitleLanguage(lang: 'en' | 'es'): void {
    if (this.selectedSubtitle !== lang) {
      this.selectedSubtitle = lang; // Actualiza el estado para los botones

      const video = this.videoPlayer?.nativeElement;
      if (video && video.textTracks) {
        console.log(`Attempting to show subtitles for: ${lang}`);
        let trackFound = false;
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (track.kind === 'subtitles') {
            // Comprueba usando srclang (más fiable)
            if (track.language === lang) {
              track.mode = 'showing'; // Activa la pista seleccionada
              trackFound = true;
              console.log(`Track mode set to 'showing' for language: ${track.language}`);
            } else {
              track.mode = 'hidden'; // Oculta las otras pistas
               console.log(`Track mode set to 'hidden' for language: ${track.language}`);
            }
          }
        }
        if (!trackFound) {
            console.warn(`Subtitle track for language '${lang}' not found in TextTrackList.`);
        }
      }
      // Ya no es necesario llamar a updateVideoPlayer aquí
    }
  }


  // --- MODIFICADO: Añade ambas pistas y marca la default ---
  private updateVideoPlayer(): void {
    // Usamos setTimeout para asegurar que @ViewChild esté listo
    setTimeout(() => {
      const video = this.videoPlayer?.nativeElement;

      if (!video || !this.videoUrl) {
        this.clearPlayer(); // Limpia si no hay video o URL
        return;
      }

      const currentTime = video.currentTime;
      const isPaused = video.paused;

      // Asignar la URL del video si ha cambiado
      if (video.currentSrc !== this.videoUrl) {
        video.src = this.videoUrl;
        console.log("Video source updated.");
      } else {
         console.log("Video source already set.");
      }

      // --- Limpiar pistas <track> existentes del DOM ---
      // Esto es más fiable que manipular video.textTracks directamente para eliminar
      const existingTrackElements = video.querySelectorAll('track');
      if (existingTrackElements.length > 0) {
          console.log(`Removing ${existingTrackElements.length} existing <track> elements.`);
          existingTrackElements.forEach(trackEl => video.removeChild(trackEl));
      } else {
          console.log("No existing <track> elements to remove.");
      }
      // --- Fin Limpiar pistas ---


      // --- Añadir nuevas pistas <track> ---
      let tracksAdded = false;

      // Añadir pista EN si existe
      if (this.subtitleENUrl) {
        const trackElementEN = document.createElement('track');
        trackElementEN.kind = 'subtitles';
        trackElementEN.src = this.subtitleENUrl;
        trackElementEN.srclang = 'en'; // Estándar IETF BCP 47
        trackElementEN.label = 'English'; // Etiqueta para la UI del navegador
        // Marcar como default si coincide con el idioma detectado
        if (this.browserDetectedLanguage === 'en') {
          trackElementEN.default = true;
          console.log("English track marked as default.");
        }
        video.appendChild(trackElementEN);
        tracksAdded = true;
        console.log("Added English <track> element.");
      }

      // Añadir pista ES si existe
      if (this.subtitleESUrl) {
        const trackElementES = document.createElement('track');
        trackElementES.kind = 'subtitles';
        trackElementES.src = this.subtitleESUrl;
        trackElementES.srclang = 'es'; // Estándar IETF BCP 47
        trackElementES.label = 'Español'; // Etiqueta para la UI del navegador
         // Marcar como default si coincide con el idioma detectado
        if (this.browserDetectedLanguage === 'es') {
          trackElementES.default = true;
          console.log("Spanish track marked as default.");
        }
        video.appendChild(trackElementES);
        tracksAdded = true;
         console.log("Added Spanish <track> element.");
      }
      // --- Fin Añadir nuevas pistas ---

      // Si se añadieron pistas o cambió la fuente, cargar el video
      if (tracksAdded || video.currentSrc !== this.videoUrl) {
        console.log("Loading video to apply source/track changes...");
        video.load(); // Carga el video para que reconozca las nuevas pistas

        // Restaurar estado después de que los metadatos se carguen
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded.");
          video.currentTime = currentTime; // Restaurar tiempo
          if (!isPaused) {
            video.play().catch(e => console.error("Error trying to resume playback:", e));
          }

          // --- Verificación del estado de las pistas post-carga ---
          // El navegador *debería* activar la pista 'default', pero verificamos
          console.log(`Verifying track modes after load. Detected browser lang: ${this.browserDetectedLanguage}`);
          let defaultTrackShowing = false;
          if (video.textTracks && video.textTracks.length > 0) {
                for (let i = 0; i < video.textTracks.length; i++) {
                    const track = video.textTracks[i];
                    console.log(`Track ${i}: lang=${track.language}, label=${track.label}, mode=${track.mode}`);
                     // Comprobar si la pista que debería ser default está activa
                    if (track.language === this.browserDetectedLanguage && track.mode === 'showing') {
                         defaultTrackShowing = true;
                         console.log(`Default track (${this.browserDetectedLanguage}) is correctly showing.`);
                    }
                     // Si no se detectó idioma o la default no se activó, intenta activar la correcta manualmente
                     // (Esto es un extra de robustez, 'default' debería bastar)
                     /*
                     if (!defaultTrackShowing && track.language === this.browserDetectedLanguage) {
                         track.mode = 'showing';
                         console.log(`Manually setting default track (${this.browserDetectedLanguage}) mode to 'showing'.`);
                     } else if (track.language !== this.browserDetectedLanguage) {
                         track.mode = 'hidden'; // Asegurar que las otras estén ocultas
                     }
                     */
                }
                 // Si después de todo, ninguna pista 'showing' es la default, loguear advertencia.
                 if (!defaultTrackShowing) {
                    console.warn(`The default track (${this.browserDetectedLanguage}) was not automatically set to 'showing' by the browser. User might need to select it manually initially.`);
                 }

          } else {
               console.log("No text tracks found after loading metadata.");
          }
          // --- Fin Verificación ---


          video.onloadedmetadata = null; // Limpiar listener
        };

        video.onerror = (e) => {
          console.error('Error loading video or subtitles for preview:', e);
          this.videoError = 'Error loading video or subtitles for preview.';
          // No limpiar el reproductor aquí necesariamente, podría ser un error temporal de red al cargar subtítulo
          video.onerror = null;
        };

      } else {
           console.log("No source or track changes detected, skipping video.load().");
      }

    }); // Fin del setTimeout
  }

  // --- MODIFICADO: Limpia ambos reproductores ---
  private clearPlayer(): void {
     console.log("Clearing players and revoking video URL if necessary.");
    // Limpiar reproductor principal
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.pause();
      video.removeAttribute('src'); // Elimina el atributo src
      // Eliminar todos los elementos <track> hijos
      const existingTrackElements = video.querySelectorAll('track');
      existingTrackElements.forEach(trackEl => video.removeChild(trackEl));
      video.load(); // Cargar para restablecer
    }
    // Limpiar previsualización pequeña
    if (this.videoPreview?.nativeElement) {
       const preview = this.videoPreview.nativeElement;
       preview.pause();
       preview.removeAttribute('src');
       preview.load();
    }
    // Revocar la URL del video si existe (las de subtítulos se revocan al deseleccionar o destruir)
    this.revokeUrl(this.videoUrl);
    this.videoUrl = null; // Limpiar la propiedad también
  }


  onSubmitVideo(): void {
    if (this.videoForm.invalid) {
      this.videoError = 'Por favor, completa correctamente el título y la descripción.';
      Object.values(this.videoForm.controls).forEach(control => control.markAsTouched());
      this.uploadSuccessMessage = null;
      return;
    }
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

    this.videoError = null;
    this.uploadSuccessMessage = null;
    this.isLoading = true;

    const formData = new FormData();
    formData.append('title', this.videoForm.get('title')?.value);
    formData.append('description', this.videoForm.get('description')?.value);
    formData.append('video_file', this.currentVideoFile, this.currentVideoFile.name);
    formData.append('subtitle_spanish', this.subtitleESFile, this.subtitleESFile.name);
    formData.append('subtitle_english', this.subtitleENFile, this.subtitleENFile.name);

    this.uploadSubscription = this.videoService.uploadVideo(formData).subscribe({
      next: (response: VideoInterface) => {
        console.log('Video subido exitosamente:', response);
        this.uploadSuccessMessage = '¡Video subido correctamente!';
        this.videoError = null;
        this.isLoading = false;
        this.resetForm(); // Limpia todo
      },
      error: (error: any) => {
        console.error('Error subiendo video:', error);
        // Asumiendo que el servicio devuelve un objeto error con `message`
        this.videoError = `Error al subir video: ${error?.message || error || 'Ocurrió un error desconocido.'}`;
        this.uploadSuccessMessage = null;
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.videoForm.reset();

    if (this.videoFileInput) this.videoFileInput.nativeElement.value = '';
    if (this.subtitleEsInput) this.subtitleEsInput.nativeElement.value = '';
    if (this.subtitleEnInput) this.subtitleEnInput.nativeElement.value = '';

    this.currentVideoFile = null;
    this.subtitleENFile = null;
    this.subtitleESFile = null;

    this.videoError = null;
    // No limpiar uploadSuccessMessage aquí para que permanezca visible tras el reset por éxito

    this.clearPlayer(); // Limpia reproductores y revoca URL de video si existe
    // Revocar URLs de subtítulos (ya deberían estar revocadas si se deseleccionaron, pero por seguridad)
    this.revokeUrl(this.subtitleESUrl);
    this.subtitleESUrl = null;
    this.revokeUrl(this.subtitleENUrl);
    this.subtitleENUrl = null;

    // Revocar todas las URLs restantes por si acaso
    this.revokeAllObjectUrls();

    // Restablecer selección de subtítulos al idioma detectado
    this.detectBrowserLanguage(); // Restablece browserDetectedLanguage y selectedSubtitle
     console.log("Form reset complete.");
  }
}