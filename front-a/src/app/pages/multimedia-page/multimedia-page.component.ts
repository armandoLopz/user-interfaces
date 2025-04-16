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
  rotationAngle: number = 0;

  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  selectedSubtitle: string = 'es';
  currentVideoFile: any = null;
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

    this.adjustSubtitles();
  }

  ngOnDestroy(): void {
    if (this.cropper) this.cropper.destroy();
    [this.subtitleENUrl, this.subtitleESUrl, this.imagePreview, this.croppedImage]
      .forEach(url => url && typeof url === 'string' && URL.revokeObjectURL(url));
  }

  // Video Section
  onVideoFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      this.videoError = "Formato de video no soportado. Use MP4 o WebM.";
      this.videoForm.patchValue({ videoFile: null });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.videoError = "El tamaño del video excede los 50MB.";
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

  onSubtitleESChange(event: any) {
    this.handleSubtitleChange(event, 'subtitleES');
  }

  onSubtitleENChange(event: any) {
    this.handleSubtitleChange(event, 'subtitleEN');
  }

  private handleSubtitleChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.vtt') && !file.name.endsWith('.srt')) {
      this.videoError = `Formato de subtítulos no soportado. Use .vtt o .srt.`;
      this.videoForm.patchValue({ [controlName]: null });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      const dialogueLines = content.split('\n').filter((line: string) =>
        line.trim() && !line.includes('-->') && !line.match(/^\d+$/) &&
        !line.startsWith('WEBVTT') && !line.startsWith('NOTE')
      );

      if (dialogueLines.length < 10) {
        this.videoError = `El archivo debe contener al menos 10 líneas de diálogo.`;
        this.videoForm.patchValue({ [controlName]: null });
        return;
      }

      this.videoForm.patchValue({ [controlName]: file });
      this.updateSubtitleUrl(file, controlName);
      this.updateVideoPlayerSubtitles();
    };
    reader.readAsText(file);
  }

  private updateSubtitleUrl(file: File, controlName: string) {
    const urlProp = controlName === 'subtitleEN' ? 'subtitleENUrl' : 'subtitleESUrl';
    if (this[urlProp]) URL.revokeObjectURL(this[urlProp]);
    this[urlProp] = URL.createObjectURL(file);
  }

  private updateVideoPlayerSubtitles() {
    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement) return;

    while (videoElement.firstChild?.nodeName.toLowerCase() === 'track') {
      videoElement.removeChild(videoElement.firstChild);
    }

    [['es', this.subtitleESUrl], ['en', this.subtitleENUrl]].forEach(([lang, url]) => {
      if (url) {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = lang === 'es' ? 'Español' : 'English';
        track.srclang = lang as string;
        track.src = url;
        if (this.selectedSubtitle === lang) track.default = true;
        videoElement.appendChild(track);
      }
    });

    setTimeout(() => {
      Array.from(videoElement.textTracks).forEach((track: any) => {
        track.mode = track.language === this.selectedSubtitle ? 'showing' : 'hidden';
      });
    }, 100);
  }

  onSubmitVideo() {
    if (this.videoForm.invalid) {
      this.videoError = "Complete todos los campos requeridos.";
      return;
    }

    const formData = new FormData();
    Object.keys(this.videoForm.controls).forEach(key => {
      formData.append(key, this.videoForm.get(key)?.value);
    });

    console.log('Video subido', formData);
    alert('Video subido correctamente');
    this.resetVideoForm();
  }

  private resetVideoForm() {
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

  // Image Section
  onImageFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.imageError = "Formato de imagen no permitido.";
      this.resetImageForm();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 800 || img.height < 600) {
          this.imageError = "Dimensiones mínimas 800x600px.";
          this.resetImageForm();
          return;
        }

        this.imageError = '';
        this.imagePreview = e.target.result;
        this.imageForm.patchValue({ imageFile: file });
        this.isImageLoaded = true;

        setTimeout(() => {
          this.initCropper();
          this.centerImage();
        }, 200);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private resetImageForm() {
    this.imageForm.patchValue({ imageFile: null });
    this.imagePreview = null;
    this.isImageLoaded = false;
    if (this.cropper) this.cropper.destroy();
  }

  initCropper() {
    if (this.cropper) this.cropper.destroy();

    if (this.imageElement?.nativeElement) {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 1,
        viewMode: 3,
        autoCropArea: 1,
        dragMode: 'move',
        background: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        zoomOnWheel: false,
        ready: () => this.centerImage()
      });
    }
  }

  private centerImage() {
    if (this.cropper) {
      const containerData = this.cropper.getContainerData();
      console.log(containerData);
      
      this.cropper.setCropBoxData({
        left: 0,
        top: 0,
        width: containerData.width / 2,
        height: containerData.height / 2
      });
    }
  }

  rotateImage(degrees: number) {
    if (this.cropper) {
      this.cropper.rotateTo(this.cropper.getData().rotate + degrees);
      this.centerImage();
    }
  }

  zoomIn() { this.cropper?.zoom(0.1); this.centerImage(); }
  zoomOut() { this.cropper?.zoom(-0.1); this.centerImage(); }

  setMoveMode() {
    this.cropper?.setDragMode('move');
    this.centerImage();
  }

  setZoomMode() {
    this.cropper?.setDragMode('crop');
  }

  onCropImage() {
    if (this.cropper) {
      const croppedCanvas = this.cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      croppedCanvas.toBlob(blob => {
        if (blob) {
          if (this.croppedImage) URL.revokeObjectURL(this.croppedImage);
          this.croppedImage = URL.createObjectURL(blob);
        }
      }, 'image/png');
    }
  }

  onSubmitImage() {
    if (!this.croppedImage) {
      this.imageError = "Debe recortar la imagen primero.";
      return;
    }

    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('croppedImage', blob, 'cropped-image.png');
        console.log('Imagen guardada', formData);
        alert('Imagen guardada correctamente');
        this.resetImageForm();
        this.croppedImage = null;
      });
  }

  adjustSubtitles() {
    this.selectedSubtitle = navigator.language.startsWith('es') ? 'es' : 'en';
  }

  // Reiniciar el recorte de la imagen
  resetCropper() {
    if (this.cropper) {
      this.cropper.reset();
      this.rotationAngle = 0;
    }
  }

  changeSubtitleLanguage(lang: string) {
    this.selectedSubtitle = lang;
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      Array.from(videoElement.textTracks).forEach((track: any) => {
        track.mode = track.language === lang ? 'showing' : 'hidden';
      });
    }
  }
}