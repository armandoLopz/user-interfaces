import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for @if etc.
import { VideoInterface } from '../../interfaces/interfaces.models';
import { VideoService } from '../../services/multimedia/video.service';
@Component({
  selector: 'app-videos',
  standalone: true,
  // Ensure CommonModule and ReactiveFormsModule are imported
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './videos.component.html',
  styleUrls: [] // Add styleUrls if you have specific styles
})
export class VideosComponent implements OnInit, OnDestroy {
  // Using non-null assertion operator `!` as they are expected to be available after view init
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

  // Default to English, will be updated based on browser language
  selectedSubtitle: 'en' | 'es' = 'en';

  private readonly MAX_VIDEO_SIZE = 52428800; // 50MB in bytes
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
  private readonly ALLOWED_SUBTITLE_EXTENSIONS = ['.vtt', '.srt'];

  // Store object URLs to revoke them later
  private objectUrls: string[] = [];

  constructor(private fb: FormBuilder) {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
      // Note: File inputs are not part of the reactive form group directly
    });
  }

  ngOnInit(): void {
    // Detect browser language and set subtitle language accordingly
    this.detectBrowserLanguage();
  }

  ngOnDestroy(): void {
    // Clean up object URLs to prevent memory leaks
    this.revokeObjectUrls();
  }

  private detectBrowserLanguage(): void {
    // Use try-catch in case navigator or navigator.language is unavailable (unlikely but safe)
    try {
        const browserLang = navigator.language?.toLowerCase() || 'en'; // Default to 'en' if undefined
        this.selectedSubtitle = browserLang.startsWith('es') ? 'es' : 'en';
    } catch (error) {
        console.warn('Could not detect browser language, defaulting to English.', error);
        this.selectedSubtitle = 'en';
    }
  }

  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoError = null; // Clear previous errors

    if (!input.files || input.files.length === 0) {
      this.currentVideoFile = null;
      this.revokeUrl(this.videoUrl);
      this.videoUrl = null;
      // Clear player too if video is removed
      this.clearPlayer();
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      this.videoError = `Invalid video format. Only MP4 and WebM formats are allowed. Found: ${file.type || 'unknown'}`;
      input.value = ''; // Clear the input
      this.currentVideoFile = null;
      this.revokeUrl(this.videoUrl);
      this.videoUrl = null;
      this.clearPlayer();
      return;
    }

    // Validate file size
    if (file.size > this.MAX_VIDEO_SIZE) {
      this.videoError = `Video file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 50MB.`;
      input.value = ''; // Clear the input
      this.currentVideoFile = null;
      this.revokeUrl(this.videoUrl);
      this.videoUrl = null;
      this.clearPlayer();
      return;
    }

    // Store the file
    this.currentVideoFile = file;

    // Create a new URL for the video preview
    this.revokeUrl(this.videoUrl); // Revoke previous video URL if exists
    this.videoUrl = this.createAndTrackUrl(file);

    // Set the video source for preview (using setTimeout to ensure element is ready)
    // A more robust solution might involve AfterViewInit or ChangeDetectorRef if issues persist
    setTimeout(() => {
      if (this.videoPreview?.nativeElement && this.videoUrl) {
        this.videoPreview.nativeElement.src = this.videoUrl;
        this.videoPreview.nativeElement.load(); // Ensure controls/metadata load
      }
      // Also update the main player if it's currently visible
      this.updateVideoPlayer();
    });
  }

  onSubtitleESChange(event: Event): void {
    const file = this.handleSubtitleChange(event);
    if (file === null) { // Error occurred or no file
        this.subtitleESFile = null;
        this.revokeUrl(this.subtitleESUrl);
        this.subtitleESUrl = null;
    } else if (file) { // Valid file selected
        this.subtitleESFile = file;
        this.revokeUrl(this.subtitleESUrl);
        this.subtitleESUrl = this.createAndTrackUrl(file);
    } // else: file is undefined (cleared input), do nothing extra

    // Update video player if it exists
    this.updateVideoPlayer();
  }

  onSubtitleENChange(event: Event): void {
    const file = this.handleSubtitleChange(event);
     if (file === null) { // Error occurred or no file
        this.subtitleENFile = null;
        this.revokeUrl(this.subtitleENUrl);
        this.subtitleENUrl = null;
    } else if (file) { // Valid file selected
        this.subtitleENFile = file;
        this.revokeUrl(this.subtitleENUrl);
        this.subtitleENUrl = this.createAndTrackUrl(file);
    } // else: file is undefined (cleared input), do nothing extra

    // Update video player if it exists
    this.updateVideoPlayer();
  }

  // Helper for subtitle file handling and validation
  private handleSubtitleChange(event: Event): File | null | undefined {
      const input = event.target as HTMLInputElement;
      this.videoError = null; // Clear previous errors

      if (!input.files || input.files.length === 0) {
        return undefined; // Indicates input was cleared
      }

      const file = input.files[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      // Validate file format
      if (!this.ALLOWED_SUBTITLE_EXTENSIONS.includes(fileExtension)) {
        this.videoError = `Invalid subtitle format. Only ${this.ALLOWED_SUBTITLE_EXTENSIONS.join(', ')} formats are allowed. Found: ${fileExtension}`;
        input.value = ''; // Clear the input
        return null; // Indicates error
      }

      // Basic VTT/SRT validation (minimum 10 lines - check presence of line breaks)
      // This is a very basic check, proper parsing is complex
      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim() !== '').length;
          // Rough check: VTT needs WEBVTT header, SRT usually starts with '1'. Plus dialogue lines.
          if (lines < 11) { // 10 dialogue lines + potentially header/numbering
             // Set error async, might need ChangeDetectorRef.detectChanges() for immediate UI update
             // Or handle this validation server-side / more robustly client-side
             console.warn(`Subtitle file ${file.name} has fewer than 10 dialogue lines.`);
             // Optionally set this.videoError here, but be mindful of async nature
          }
      };
      reader.onerror = () => {
        this.videoError = `Could not read subtitle file ${file.name}.`;
      };
      reader.readAsText(file);


      return file; // Indicates success
  }


  changeSubtitleLanguage(lang: 'en' | 'es'): void {
    if (this.selectedSubtitle !== lang) {
        this.selectedSubtitle = lang;
        this.updateVideoPlayer();
    }
  }

  private updateVideoPlayer(): void {
    // Use setTimeout for timing, similar to preview
    setTimeout(() => {
      if (this.videoPlayer?.nativeElement && this.videoUrl && (this.subtitleENUrl || this.subtitleESUrl)) {
        const video = this.videoPlayer.nativeElement;
        const currentTime = video.currentTime; // Preserve current playback time
        const isPaused = video.paused; // Preserve pause state

        // Set video source if it's different (or initially set)
        if (video.currentSrc !== this.videoUrl) {
             video.src = this.videoUrl;
        }

        // Clear existing tracks before adding new ones
        // Iterate backwards when removing nodes from a live NodeListOf
        const tracks = video.textTracks; // Get TextTrackList
        for (let i = tracks.length - 1; i >= 0; i--) {
            // Hide the track to visually remove subtitles immediately
            tracks[i].mode = 'hidden';
        }
        // Remove track elements from DOM
        while (video.firstChild) {
           if (video.firstChild.nodeName === 'TRACK') {
               video.removeChild(video.firstChild);
           } else {
               // Should ideally only be track elements, but be safe
               break;
           }
        }

        // Add the selected subtitle track if its URL exists
        let trackAdded = false;
        const subtitleUrl = this.selectedSubtitle === 'en' ? this.subtitleENUrl : this.subtitleESUrl;
        const subtitleLang = this.selectedSubtitle;
        const subtitleLabel = this.selectedSubtitle === 'en' ? 'English' : 'Spanish';

        if (subtitleUrl) {
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.src = subtitleUrl;
          track.srclang = subtitleLang;
          track.label = subtitleLabel;
          track.default = true; // Make this track the default active one
          video.appendChild(track);
          trackAdded = true;
        }

        // Load the video to apply source and track changes
        video.load();

        // Restore playback state after load potentially resets it
        video.onloadedmetadata = () => {
          video.currentTime = currentTime;
          if (!isPaused) {
            video.play().catch(e => console.error("Error trying to resume playback:", e));
          }
           // Ensure the newly added track is showing (sometimes 'default' isn't enough)
          if (trackAdded) {
                for (let i = 0; i < video.textTracks.length; i++) {
                    if (video.textTracks[i].language === subtitleLang) {
                        video.textTracks[i].mode = 'showing';
                        break;
                    }
                }
            }
          video.onloadedmetadata = null; // Remove listener once applied
        };

      } else if (this.videoPlayer?.nativeElement) {
          // If no video URL or no subtitles available, clear the player
          this.clearPlayer();
      }
    });
  }

  private clearPlayer(): void {
     if (this.videoPlayer?.nativeElement) {
        const video = this.videoPlayer.nativeElement;
        video.pause();
        video.removeAttribute('src'); // Remove src attribute
        while (video.firstChild) { // Remove track elements
            video.removeChild(video.firstChild);
        }
        video.load(); // Reload to reflect the empty state
     }
  }

  onSubmitVideo(): void {
    // Ensure form is valid
    if (this.videoForm.invalid) {
      this.videoError = 'Please fill in all required fields (Title, Description).';
      // Mark all fields as touched to display validation messages
      Object.values(this.videoForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Ensure files are selected
    if (!this.currentVideoFile) {
      this.videoError = 'Please select a video file.';
      return;
    }
    if (!this.subtitleENFile) {
      this.videoError = 'Please upload the English subtitles file (.vtt or .srt).';
      return;
    }
    if (!this.subtitleESFile) {
      this.videoError = 'Please upload the Spanish subtitles file (.vtt or .srt).';
      return;
    }

    // Clear any previous errors
    this.videoError = null;

    // Placeholder for actual upload logic
    console.log('Video submission ready:', {
      title: this.videoForm.get('title')?.value,
      description: this.videoForm.get('description')?.value,
      videoFile: this.currentVideoFile,
      subtitleENFile: this.subtitleENFile,
      subtitleESFile: this.subtitleESFile
    });

    alert('Video ready for upload! See console for details.');
    // TODO: Implement actual file upload service call here
    // Example: this.uploadService.uploadVideo(formData).subscribe(...)

    // Optionally reset form after successful pseudo-upload
    // this.resetForm();
  }

  resetForm(): void {
      this.videoForm.reset();
      this.currentVideoFile = null;
      this.subtitleENFile = null;
      this.subtitleESFile = null;
      this.videoError = null;
      this.revokeUrl(this.videoUrl);
      this.revokeUrl(this.subtitleENUrl);
      this.revokeUrl(this.subtitleESUrl);
      this.videoUrl = null;
      this.subtitleENUrl = null;
      this.subtitleESUrl = null;
      this.clearPlayer();
  }

  // --- Object URL Management ---

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

  private revokeObjectUrls(): void {
      console.log(`Revoking ${this.objectUrls.length} object URLs.`);
      this.objectUrls.forEach(url => URL.revokeObjectURL(url));
      this.objectUrls = []; // Clear the array
  }
}