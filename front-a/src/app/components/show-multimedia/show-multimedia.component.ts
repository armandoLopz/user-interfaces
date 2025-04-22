import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageService } from '../../services/multimedia/image.service';
import { VideoService } from '../../services/multimedia/video.service';
import { VideoInterface, ImageInterface } from '../../interfaces/interfaces.models';
import { Subscription, catchError, of } from 'rxjs';
import { NgClass, CommonModule } from '@angular/common'; // Import CommonModule for NgIf, NgFor, etc.

// Definimos una interfaz local que extiende la original para manejar el estado del placeholder
interface VideoDisplay extends VideoInterface {
  showPlaceholder: boolean; // Propiedad para controlar la visibilidad del placeholder
}

@Component({
  selector: 'app-show-multimedia',
  standalone: true, // El componente es standalone
  imports: [
    CommonModule, // Import CommonModule for NgIf, NgFor, NgClass, etc.
    NgClass // NgClass is also included in CommonModule, but listed here for clarity if preferred
  ],
  templateUrl: './show-multimedia.component.html',
  styleUrls: ['./show-multimedia.component.css']
})
export class ShowMultimediaComponent implements OnInit, OnDestroy {

  // Usamos la nueva interfaz extendida para la lista de videos
  videos: VideoDisplay[] = [];
  images: ImageInterface[] = [];
  activeTab: 'videos' | 'images' = 'videos';
  videoLoading = true;
  imageLoading = true;
  videoError: string | null = null;
  imageError: string | null = null;

  private subscriptions: Subscription = new Subscription();

  // Carousel state
  currentVideoIndex = 0;
  currentImageIndex = 0;
  itemsPerSlide = 3; // Number of items to show per slide

  constructor(
    private videoService: VideoService,
    private imageService: ImageService
  ) { }

  ngOnInit(): void {
    // Cargar datos cuando el componente se inicializa
    this.loadVideos();
    this.loadImages();
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones para prevenir fugas de memoria
    this.subscriptions.unsubscribe();
  }

  /**
   * Obtiene los datos de videos desde el VideoService.
   */
  loadVideos(): void {
    this.videoLoading = true;
    this.videoError = null; // Limpiar errores previos
    this.subscriptions.add(
      this.videoService.getAllVideos().pipe(
        catchError(error => {
          console.error('Error loading videos:', error);
          // Establecer un mensaje de error amigable para el usuario
          this.videoError = 'Failed to load videos. Please try again later.';
          this.videoLoading = false;
          // Retornar un observable vacío para completar el stream y evitar que los errores rompan la aplicación
          return of([]);
        })
      ).subscribe(data => {
        // Mapeamos los datos recibidos a nuestra nueva interfaz, inicializando showPlaceholder a true
        this.videos = data.map(video => ({
          ...video,
          showPlaceholder: true // Inicialmente mostramos el placeholder para cada video
        }));
        this.videoLoading = false;

        console.log(this.videos);
        console.log(this.videos.length);
        
        
      })
    );
    
  }

  /**
   * Obtiene los datos de imágenes desde el ImageService.
   */
  loadImages(): void {
    this.imageLoading = true;
    this.imageError = null; // Limpiar errores previos
    this.subscriptions.add(
      this.imageService.getAllimages().pipe(
        catchError(error => {
          console.error('Error loading images:', error);
           // Establecer un mensaje de error amigable
          this.imageError = 'Failed to load images. Please try again later.';
          this.imageLoading = false;
           // Retornar un observable vacío
          return of([]);
        })
      ).subscribe(data => {
        this.images = data;
        this.imageLoading = false;
      })
      
    );
  }

  /**
   * Establece la pestaña de medios activa actualmente.
   * @param tab - La pestaña a activar ('videos' o 'images').
   */
  setActiveTab(tab: 'videos' | 'images'): void {
    this.activeTab = tab;
    // Reset indices when changing tabs
    this.currentVideoIndex = 0;
    this.currentImageIndex = 0;
  }

  /**
   * Se llama cuando un elemento de video ha cargado suficientes datos para mostrar un frame.
   * Oculta el placeholder correspondiente para ese video.
   * @param video El objeto de video cargado (con la propiedad showPlaceholder).
   */
  onVideoLoaded(video: VideoDisplay): void {
    video.showPlaceholder = false;
  }

  // --- Carousel Navigation Logic ---

  /**
   * Moves the video carousel to the next set of items.
   */
  nextVideo(): void {
    const nextIndex = this.currentVideoIndex + this.itemsPerSlide;
    if (nextIndex < this.videos.length) {
      this.currentVideoIndex = nextIndex;
    } else {
      // Wrap around to the beginning
      this.currentVideoIndex = 0;
    }
  }

  /**
   * Moves the video carousel to the previous set of items.
   */
  prevVideo(): void {
    const prevIndex = this.currentVideoIndex - this.itemsPerSlide;
    if (prevIndex >= 0) {
      this.currentVideoIndex = prevIndex;
    } else {
      // Wrap around to the end
      // Calculate the index of the last full slide, or the very last item if not a full slide
      const remainingItems = this.videos.length % this.itemsPerSlide;
      if (remainingItems === 0) {
         // If total items is a multiple of itemsPerSlide, go back to the start of the last full slide
        this.currentVideoIndex = this.videos.length - this.itemsPerSlide;
      } else {
        // Go back to the start of the last partial slide
        this.currentVideoIndex = this.videos.length - remainingItems;
      }
       // Handle case where there are fewer items than itemsPerSlide
       if (this.currentVideoIndex < 0 && this.videos.length > 0) {
           this.currentVideoIndex = 0; // Go to the first slide if wrapping back from the beginning
       } else if (this.videos.length === 0) {
           this.currentVideoIndex = 0; // Keep at 0 if there are no videos
       }
    }
  }


  /**
   * Moves the image carousel to the next set of items.
   */
  nextImage(): void {
    const nextIndex = this.currentImageIndex + this.itemsPerSlide;
    if (nextIndex < this.images.length) {
      this.currentImageIndex = nextIndex;
    } else {
      // Wrap around to the beginning
      this.currentImageIndex = 0;
    }
  }

  /**
   * Moves the image carousel to the previous set of items.
   */
  prevImage(): void {
    const prevIndex = this.currentImageIndex - this.itemsPerSlide;
     if (prevIndex >= 0) {
      this.currentImageIndex = prevIndex;
    } else {
      // Wrap around to the end
       const remainingItems = this.images.length % this.itemsPerSlide;
       if (remainingItems === 0) {
          this.currentImageIndex = this.images.length - this.itemsPerSlide;
       } else {
         this.currentImageIndex = this.images.length - remainingItems;
       }
        // Handle case where there are fewer items than itemsPerSlide
       if (this.currentImageIndex < 0 && this.images.length > 0) {
           this.currentImageIndex = 0; // Go to the first slide if wrapping back from the beginning
       } else if (this.images.length === 0) {
           this.currentImageIndex = 0; // Keep at 0 if there are no images
       }
    }
  }

  /**
   * Gets the videos that should be currently displayed in the carousel.
   * @returns An array of VideoDisplay objects.
   */
  get displayedVideos(): VideoDisplay[] {
    return this.videos.slice(this.currentVideoIndex, this.currentVideoIndex + this.itemsPerSlide);
  }

   /**
   * Gets the images that should be currently displayed in the carousel.
   * @returns An array of ImageInterface objects.
   */
  get displayedImages(): ImageInterface[] {
    return this.images.slice(this.currentImageIndex, this.currentImageIndex + this.itemsPerSlide);
  }

   // Determine if the previous button should be disabled (optional)
   // isPrevDisabled(currentIndex: number, totalItems: number): boolean {
   //   return currentIndex === 0;
   // }

   // Determine if the next button should be disabled (optional)
   // isNextDisabled(currentIndex: number, totalItems: number): boolean {
   //    return currentIndex + this.itemsPerSlide >= totalItems;
   // }
}