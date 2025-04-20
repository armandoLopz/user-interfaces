import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-multimedia-page',
  standalone: true,
  imports: [SideBarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './multimedia-page.component.html',
  styleUrls: ['./multimedia-page.component.css']
})
export class MultimediaPageComponent implements OnInit, OnDestroy {
  videoForm!: FormGroup;
  imageForm!: FormGroup;
  videoError: string = '';
  imageError: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  croppedImage: string | null = null;
  cropper: Cropper | null = null;
  isImageLoaded: boolean = false;

  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  selectedSubtitle: string = 'en';
  currentVideoFile: File | null = null;
  subtitleENUrl: string | null = null;
  subtitleESUrl: string | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      videoFile: [null, Validators.required],
      subtitleES: [null, Validators.required],
      subtitleEN: [null, Validators.required]
    });

    this.imageForm = this.fb.group({
      imageFile: [null, Validators.required]
    });

    // Set subtitle language based on browser language
    this.selectedSubtitle = navigator.language.startsWith('es') ? 'es' : 'en';
  }

  ngOnDestroy(): void {
    // Clean up resources
    this.destroyCropper();
    this.revokeObjectURLs();
  }

  private revokeObjectURLs(): void {
    [this.subtitleENUrl, this.subtitleESUrl, this.imagePreview, this.croppedImage]
      .filter(url => url && typeof url === 'string' && url.startsWith('blob:'))
      .forEach(url => URL.revokeObjectURL(url as string));
  }

  // VIDEO SECTION METHODS
  
  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      this.videoError = "Unsupported video format. Please use MP4 or WebM.";
      this.videoForm.patchValue({ videoFile: null });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.videoError = "Video size exceeds 50MB limit.";
      this.videoForm.patchValue({ videoFile: null });
      return;
    }

    this.videoError = '';
    this.currentVideoFile = file;
    this.videoForm.patchValue({ videoFile: file });

    const videoUrl = URL.createObjectURL(file);
    
    if (this.videoPreview?.nativeElement) {
      this.videoPreview.nativeElement.src = videoUrl;
    }
    
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.src = videoUrl;
      this.updateVideoPlayerSubtitles();
    }
  }

  onSubtitleESChange(event: Event): void {
    this.handleSubtitleChange(event, 'subtitleES');
  }

  onSubtitleENChange(event: Event): void {
    this.handleSubtitleChange(event, 'subtitleEN');
  }

  private handleSubtitleChange(event: Event, controlName: 'subtitleEN' | 'subtitleES'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    if (!file.name.endsWith('.vtt') && !file.name.endsWith('.srt')) {
      this.videoError = `Unsupported subtitle format. Please use .vtt or .srt.`;
      this.videoForm.patchValue({ [controlName]: null });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      const dialogueLines = content.split('\n').filter(line =>
        line.trim() && !line.includes('-->') && !line.match(/^\d+$/) &&
        !line.startsWith('WEBVTT') && !line.startsWith('NOTE')
      );

      if (dialogueLines.length < 10) {
        this.videoError = `Subtitle file must contain at least 10 dialogue lines.`;
        this.videoForm.patchValue({ [controlName]: null });
        return;
      }

      this.videoForm.patchValue({ [controlName]: file });
      this.updateSubtitleUrl(file, controlName);
      this.updateVideoPlayerSubtitles();
    };
    reader.readAsText(file);
  }

  private updateSubtitleUrl(file: File, controlName: 'subtitleEN' | 'subtitleES'): void {
    const urlProp = controlName === 'subtitleEN' ? 'subtitleENUrl' : 'subtitleESUrl';
    if (this[urlProp]) URL.revokeObjectURL(this[urlProp] as string);
    this[urlProp] = URL.createObjectURL(file);
  }

  private updateVideoPlayerSubtitles(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement) return;

    // Remove existing tracks
    while (videoElement.firstChild?.nodeName.toLowerCase() === 'track') {
      videoElement.removeChild(videoElement.firstChild);
    }

    // Add new tracks
    [
      { lang: 'es', url: this.subtitleESUrl, label: 'Spanish' },
      { lang: 'en', url: this.subtitleENUrl, label: 'English' }
    ].forEach(({ lang, url, label }) => {
      if (url) {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = label;
        track.srclang = lang;
        track.src = url;
        track.default = this.selectedSubtitle === lang;
        videoElement.appendChild(track);
      }
    });

    // Set track mode
    setTimeout(() => {
      Array.from(videoElement.textTracks).forEach(track => {
        track.mode = track.language === this.selectedSubtitle ? 'showing' : 'hidden';
      });
    }, 100);
  }

  changeSubtitleLanguage(lang: string): void {
    this.selectedSubtitle = lang;
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      Array.from(videoElement.textTracks).forEach(track => {
        track.mode = track.language === lang ? 'showing' : 'hidden';
      });
    }
  }

  onSubmitVideo(): void {
    if (this.videoForm.invalid) {
      this.videoError = "Please complete all required fields.";
      return;
    }

    const formData = new FormData();
    
    // Fix: Only append values that are not null/undefined and use proper typing
    Object.entries(this.videoForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Check if it's a File object
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          // Convert to string for non-File values
          formData.append(key, String(value));
        }
      }
    });

    console.log('Video uploaded', formData);
    alert('Video successfully uploaded');
    this.resetVideoForm();
  }

  private resetVideoForm(): void {
    this.videoForm.reset();
    this.videoError = '';
    this.currentVideoFile = null;
    
    [this.subtitleENUrl, this.subtitleESUrl].forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    this.subtitleENUrl = this.subtitleESUrl = null;
    
    if (this.videoPreview?.nativeElement) this.videoPreview.nativeElement.src = '';
    if (this.videoPlayer?.nativeElement) this.videoPlayer.nativeElement.src = '';
  }

  // IMAGE SECTION METHODS - FIXED
  
  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate image format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.imageError = "Unsupported image format. Please use JPG, PNG, or WebP.";
      this.resetImageForm();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        // Validate image dimensions
        if (img.width < 800 || img.height < 600) {
          this.imageError = "Image dimensions must be at least 800x600px.";
          this.resetImageForm();
          return;
        }

        this.imageError = '';
        this.imagePreview = e.target?.result as string;
        this.imageForm.patchValue({ imageFile: file });
        this.isImageLoaded = true;

        // Initialize cropper after DOM update
        setTimeout(() => {
          this.initCropper();
        }, 200);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private resetImageForm(): void {
    this.imageForm.patchValue({ imageFile: null });
    this.imagePreview = null;
    this.isImageLoaded = false;
    this.destroyCropper();
    if (this.croppedImage) {
      URL.revokeObjectURL(this.croppedImage);
      this.croppedImage = null;
    }
  }

  private destroyCropper(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  initCropper(): void {
    this.destroyCropper();
  
    if (this.imageElement?.nativeElement) {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.9,
        dragMode: 'crop',
        movable: true,            // ← permite mover la imagen
        scalable: true,           // ← opcional, para flip/scale
        guides: true,             // guías 3×3 al arrastrar
        center: true,
        highlight: true,
        background: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        zoomOnWheel: false,
        ready: () => {
          this.fitImageToContainer();
          // Arrancamos en modo crop, pero luego podrás cambiar:
          this.cropper?.setDragMode('crop');
        }
      });
    }
  }
  
  // FIXED: New method to properly fit and center the image
  private fitImageToContainer(): void {
    if (!this.cropper) return;
    
    // Get container and canvas data
    const containerData = this.cropper.getContainerData();
    const canvasData = this.cropper.getCanvasData();
    
    // Calculate scale to fit the image properly
    const scale = Math.min(
      containerData.width / canvasData.naturalWidth,
      containerData.height / canvasData.naturalHeight
    ) * 0.9; // 90% to leave some margin
    
    // Calculate new dimensions
    const newWidth = canvasData.naturalWidth * scale;
    const newHeight = canvasData.naturalHeight * scale;
    
    // Calculate position to center the image
    const left = (containerData.width - newWidth) / 2;
    const top = (containerData.height - newHeight) / 2;
    
    // Set canvas data to fit and center the image
    this.cropper.setCanvasData({
      left: left,
      top: top,
      width: newWidth,
      height: newHeight
    });
    
    // Set crop box to match the canvas
    this.cropper.setCropBoxData({
      left: left + newWidth * 0.1, // 10% margin from edges
      top: top + newHeight * 0.1,
      width: newWidth * 0.8,  // 80% of the image width
      height: newHeight * 0.8 // 80% of the image height
    });
  }

  // FIXED: Improved rotation to prevent duplication
  rotateImage(degrees: number): void {
    if (!this.cropper) return;
    
    // Get current rotation
    const currentRotation = this.cropper.getData().rotate;
    
    // Apply rotation
    this.cropper.rotateTo(currentRotation + degrees);
    
    // After rotation, refit the image to prevent duplication issues
    setTimeout(() => {
      this.fitImageToContainer();
    }, 50);
  }

  // FIXED: Improved zoom methods
  zoomIn(): void {
    if (!this.cropper) return;
    this.cropper.zoom(0.1);
  }

  zoomOut(): void {
    if (!this.cropper) return;
    this.cropper.zoom(-0.1);
  }
  
  setMoveMode(): void {
    if (!this.cropper) return;
    this.cropper.setDragMode('move');  // ya moverá la imagen en vez de redimensionar el cuadro
  }

  // FIXED: Improved crop mode
  setCropMode(): void {
    if (!this.cropper) return;
    this.cropper.setDragMode('crop');
  }

  // FIXED: Improved reset
  resetCropper(): void {
    if (!this.cropper) return;
    this.cropper.reset();
    
    // After reset, refit the image
    setTimeout(() => {
      this.fitImageToContainer();
    }, 50);

  }
  onCropImage(): void {
    if (!this.cropper) return;
    
    // Create a high-quality cropped canvas
    const croppedCanvas = this.cropper.getCroppedCanvas({
      width: 800, // Higher resolution for better quality
      height: 800,
      fillColor: '#fff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    // Convert canvas to blob
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          this.imageError = "Failed to process the image. Please try again.";
          return;
        }
        
        // Revoke previous URL if exists
        if (this.croppedImage) URL.revokeObjectURL(this.croppedImage);
        
        // Create new object URL
        this.croppedImage = URL.createObjectURL(blob);
      },
      'image/png',
      0.95 // High quality
    );
  }

  onSubmitImage(): void {
    if (!this.croppedImage) {
      this.imageError = "Please crop the image before saving.";
      return;
    }

    // Fetch the blob from the object URL
    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('croppedImage', blob, 'cropped-image.png');
        
        // Here you would typically send the formData to your server
        console.log('Image saved', formData);
        alert('Image successfully saved');
        
        // Reset the form after successful submission
        this.resetImageForm();
      })
      .catch(error => {
        this.imageError = "Failed to save the image. Please try again.";
        console.error('Error saving image:', error);
      });
  }
}