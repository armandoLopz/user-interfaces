import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageService } from '../../services/multimedia/image.service';
import { VideoService } from '../../services/multimedia/video.service';
// Import the specific interfaces you are using
import { VideoInterface, ImageInterface } from '../../interfaces/interfaces.models';
import { Subscription, catchError, of } from 'rxjs';
// Only import NgClass as it's used for [ngClass] in the template
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-show-multimedia',
  standalone: true, // The component is standalone
  imports: [
     // Required for services using HttpClient
    NgClass // Needed for [ngClass]
    // NgIf and NgFor are NOT needed here because we are using the @if and @for template syntax directly
  ],
  templateUrl: './show-multimedia.component.html',
  styleUrls: ['./show-multimedia.component.css']
})
export class ShowMultimediaComponent implements OnInit, OnDestroy {

  videos: VideoInterface[] = [];
  images: ImageInterface[] = [];
  activeTab: 'videos' | 'images' = 'videos';
  videoLoading = true;
  imageLoading = true;
  videoError: string | null = null;
  imageError: string | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private videoService: VideoService,
    private imageService: ImageService
  ) { }

  ngOnInit(): void {
    // Load data when the component initializes
    this.loadVideos();
    this.loadImages();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  /**
   * Fetches video data from the VideoService.
   */
  loadVideos(): void {
    this.videoLoading = true;
    this.videoError = null; // Clear previous errors
    this.subscriptions.add(
      this.videoService.getAllVideos().pipe(
        catchError(error => {
          console.error('Error loading videos:', error);
          // Set a user-friendly error message
          this.videoError = 'Failed to load videos. Please try again later.';
          this.videoLoading = false;
          // Return an empty observable to complete the stream and prevent errors from breaking the app
          return of([]);
        })
      ).subscribe(data => {
        this.videos = data;
        this.videoLoading = false;
      })
    );
  }

  /**
   * Fetches image data from the ImageService.
   */
  loadImages(): void {
    this.imageLoading = true;
    this.imageError = null; // Clear previous errors
    this.subscriptions.add(
      this.imageService.getAllimages().pipe(
        catchError(error => {
          console.error('Error loading images:', error);
           // Set a user-friendly error message
          this.imageError = 'Failed to load images. Please try again later.';
          this.imageLoading = false;
           // Return an empty observable
          return of([]);
        })
      ).subscribe(data => {
        this.images = data;
        this.imageLoading = false;
      })
    );
  }

  /**
   * Sets the currently active media tab.
   * @param tab - The tab to activate ('videos' or 'images').
   */
  setActiveTab(tab: 'videos' | 'images'): void {
    this.activeTab = tab;
    // You might want to reset the scroll position or carousel index here
    // if you implement a carousel with index tracking.
  }

}