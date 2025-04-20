import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './videos.component.html',
  styleUrls: []
})
export class VideosComponent implements OnInit {
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  videoForm: FormGroup;
  videoError: string | null = null;
  currentVideoFile: File | null = null;
  videoUrl: string | null = null;
  
  subtitleESFile: File | null = null;
  subtitleENFile: File | null = null;
  subtitleESUrl: string | null = null;
  subtitleENUrl: string | null = null;
  
  selectedSubtitle: 'en' | 'es' = 'en'; // Default to English
  
  private readonly MAX_VIDEO_SIZE = 52428800; // 50MB in bytes
  private readonly ALLOWED_VIDEO_FORMATS = ['video/mp4', 'video/webm'];
  private readonly ALLOWED_SUBTITLE_FORMATS = ['.vtt', '.srt'];
  
  constructor(private fb: FormBuilder) {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  ngOnInit(): void {
    // Detect browser language and set subtitle language accordingly
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      this.selectedSubtitle = 'es';
    } else {
      this.selectedSubtitle = 'en';
    }
  }
  
  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Validate file format
    if (!this.ALLOWED_VIDEO_FORMATS.includes(file.type)) {
      this.videoError = 'Invalid video format. Only MP4 and WebM formats are allowed.';
      return;
    }
    
    // Validate file size
    if (file.size > this.MAX_VIDEO_SIZE) {
      this.videoError = 'Video file is too large. Maximum allowed size is 50MB.';
      return;
    }
    
    // Clear any previous errors
    this.videoError = null;
    
    // Store the file
    this.currentVideoFile = file;
    
    // Create a URL for the video preview
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
    this.videoUrl = URL.createObjectURL(file);
    
    // Set the video source for preview
    setTimeout(() => {
      if (this.videoPreview && this.videoPreview.nativeElement) {
        this.videoPreview.nativeElement.src = this.videoUrl as string;
      }
    });
  }
  
  onSubtitleESChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    // Validate file format
    if (!this.ALLOWED_SUBTITLE_FORMATS.includes(fileExtension)) {
      this.videoError = 'Invalid subtitle format. Only .vtt and .srt formats are allowed.';
      return;
    }
    
    // Store the file
    this.subtitleESFile = file;
    
    // Create a URL for the subtitle
    if (this.subtitleESUrl) {
      URL.revokeObjectURL(this.subtitleESUrl);
    }
    this.subtitleESUrl = URL.createObjectURL(file);
    
    // Update video player if it exists
    this.updateVideoPlayer();
  }
  
  onSubtitleENChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    // Validate file format
    if (!this.ALLOWED_SUBTITLE_FORMATS.includes(fileExtension)) {
      this.videoError = 'Invalid subtitle format. Only .vtt and .srt formats are allowed.';
      return;
    }
    
    // Store the file
    this.subtitleENFile = file;
    
    // Create a URL for the subtitle
    if (this.subtitleENUrl) {
      URL.revokeObjectURL(this.subtitleENUrl);
    }
    this.subtitleENUrl = URL.createObjectURL(file);
    
    // Update video player if it exists
    this.updateVideoPlayer();
  }
  
  changeSubtitleLanguage(lang: 'en' | 'es'): void {
    this.selectedSubtitle = lang;
    this.updateVideoPlayer();
  }
  
  private updateVideoPlayer(): void {
    setTimeout(() => {
      if (this.videoPlayer && this.videoPlayer.nativeElement && this.videoUrl) {
        const video = this.videoPlayer.nativeElement;
        
        // Set video source
        video.src = this.videoUrl;
        
        // Remove any existing tracks
        while (video.firstChild) {
          video.removeChild(video.firstChild);
        }
        
        // Add the selected subtitle track
        if (this.selectedSubtitle === 'en' && this.subtitleENUrl) {
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.src = this.subtitleENUrl;
          track.srclang = 'en';
          track.label = 'English';
          track.default = true;
          video.appendChild(track);
        } else if (this.selectedSubtitle === 'es' && this.subtitleESUrl) {
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.src = this.subtitleESUrl;
          track.srclang = 'es';
          track.label = 'Spanish';
          track.default = true;
          video.appendChild(track);
        }
        
        // Load the video
        video.load();
      }
    });
  }
  
  onSubmitVideo(): void {
    if (this.videoForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.videoForm.controls).forEach(key => {
        const control = this.videoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    if (!this.currentVideoFile) {
      this.videoError = 'Please select a video file.';
      return;
    }
    
    if (!this.subtitleENFile) {
      this.videoError = 'Please upload English subtitles.';
      return;
    }
    
    if (!this.subtitleESFile) {
      this.videoError = 'Please upload Spanish subtitles.';
      return;
    }
    
    // Here you would typically send the video and subtitle files to your server
    // For example:
    // const formData = new FormData();
    // formData.append('title', this.videoForm.get('title')?.value);
    // formData.append('description', this.videoForm.get('description')?.value);
    // formData.append('video', this.currentVideoFile);
    // formData.append('subtitleEN', this.subtitleENFile);
    // formData.append('subtitleES', this.subtitleESFile);
    // 
    // this.videoService.uploadVideo(formData).subscribe(
    //   response => {
    //     console.log('Video uploaded successfully', response);
    //     // Handle success
    //   },
    //   error => {
    //     console.error('Error uploading video', error);
    //     this.videoError = 'Failed to upload video. Please try again.';
    //   }
    // );
    
    console.log('Video submitted successfully', {
      title: this.videoForm.get('title')?.value,
      description: this.videoForm.get('description')?.value,
      video: this.currentVideoFile,
      subtitleEN: this.subtitleENFile,
      subtitleES: this.subtitleESFile
    });
  }
  
  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.videoForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
  
  getFieldError(fieldName: string): string {
    const field = this.videoForm.get(fieldName);
    if (!field) return '';
    
    if (field.errors?.['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (field.errors?.['minlength']) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    
    return '';
  }
}
