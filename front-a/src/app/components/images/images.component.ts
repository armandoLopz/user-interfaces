import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css'; // Import Cropper CSS

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.css'
})
export class ImagesComponent implements AfterViewInit, OnDestroy {
  private _cropperImageElement?: ElementRef<HTMLImageElement>;
  @ViewChild('cropperImageElement')
  set cropperImageElement(element: ElementRef<HTMLImageElement> | undefined) {
    this._cropperImageElement = element;
    if (this._cropperImageElement && this.imageDataUrl()) {
       console.log('@ViewChild setter: Image element available. Setting up cropper.');
       this.setupCropper();
    } else {
       console.log('@ViewChild setter: Image element not available or no image data.');
    }
  }
  get cropperImageElement(): ElementRef<HTMLImageElement> | undefined {
      return this._cropperImageElement;
  }


  imageForm: FormGroup;
  imageError = signal<string | null>(null);
  imageDataUrl = signal<string | null>(null);
  croppedImage = signal<string | null>(null);

  private cropper?: Cropper;
  private readonly MIN_WIDTH = 800;
  private readonly MIN_HEIGHT = 600;
  private readonly ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
  // This is the desired FINAL crop output size (500x500)
  private readonly CROP_SIZE = { width: 500, height: 500 };

  private readonly MIN_CROP_BOX_SIZE = { width: 50, height: 50 }; // Minimum size for the interactive crop box
  private readonly INITIAL_CROP_AREA_PERCENTAGE = 0.8; // Define desired initial size as percentage

  constructor(private fb: FormBuilder) {
    this.imageForm = this.fb.group({
      image: [null, Validators.required]
    });
  }

  ngAfterViewInit(): void {
     // Any other post-view-initialization logic can go here.
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.resetComponentState();
      return;
    }

    const file = input.files[0];

    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      this.imageError.set('Invalid file format. Only JPG, PNG, and WebP formats are allowed.');
      this.resetComponentState();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < this.MIN_WIDTH || img.height < this.MIN_HEIGHT) {
          this.imageError.set(`Image dimensions are too small. Minimum required size is ${this.MIN_WIDTH}x${this.MIN_HEIGHT}px.`);
          this.resetComponentState();
          return;
        }

        this.imageError.set(null);
        this.croppedImage.set(null);
        this.imageDataUrl.set(e.target.result); // This triggers the @if and @ViewChild setter
        console.log('Image dimensions valid. Setting imageDataUrl.');
      };
      img.onerror = () => {
           this.imageError.set('Failed to load image.');
           this.resetComponentState();
      }
      img.src = e.target.result;
    };
    reader.onerror = () => {
        this.imageError.set('Failed to read file.');
        this.resetComponentState();
    };
    reader.readAsDataURL(file);
  }

  private setupCropper(): void {
    if (!this._cropperImageElement || !this._cropperImageElement.nativeElement) {
      console.error('Cropper image element not found for setup.');
      return;
    }

    this.destroyCropper();

    const imageElement = this._cropperImageElement.nativeElement;

    this.cropper = new Cropper(imageElement, {
      // aspectRatio: 1, // Keep commented if you want a free aspect ratio for the initial crop box
      viewMode: 1, // Restrict the crop box to not exceed the size of the canvas

      // --- REMOVED: autoCropArea ---
      // autoCropArea: 0.8, // Removed as it wasn't working as expected

      dragMode: 'crop',
      responsive: true,
      guides: true,
      highlight: true,
      background: true,
      zoomable: true,
      zoomOnTouch: true,
      zoomOnWheel: true,
      wheelZoomRatio: 0.1,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: true,

      minCropBoxWidth: this.MIN_CROP_BOX_SIZE.width,
      minCropBoxHeight: this.MIN_CROP_BOX_SIZE.height,

      ready: () => {
        if (this.cropper) {
          console.log('Cropper ready event fired');

           // --- MODIFIED: Manually set initial crop box size based on percentage ---
           const canvasData = this.cropper.getCanvasData();

           const cropBoxWidth = canvasData.width * this.INITIAL_CROP_AREA_PERCENTAGE;
           const cropBoxHeight = canvasData.height * this.INITIAL_CROP_AREA_PERCENTAGE;

           const cropBoxData = {
              width: cropBoxWidth,
              height: cropBoxHeight,
              // Center the crop box within the canvas
              left: canvasData.left + (canvasData.width - cropBoxWidth) / 2,
              top: canvasData.top + (canvasData.height - cropBoxHeight) / 2,
           };

           this.cropper.setCropBoxData(cropBoxData);

           // Ensure drag mode is 'crop' initially
           this.cropper.setDragMode('crop');

           // You can optionally re-enable centering if you want the image itself centered
           // this.cropper.center();

           console.log('Cropper initialized with initial crop box size.');
        }
      }
    });
     console.log('Cropper instance initialized.');
  }

  private destroyCropper(): void {
    if (this.cropper) {
      console.log('Destroying Cropper instance...');
      this.cropper.destroy();
      this.cropper = undefined;
    }
  }

  private resetComponentState(): void {
      console.log('Resetting component state...');
      this.destroyCropper();
      this.imageDataUrl.set(null);
      this.croppedImage.set(null);
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
      if(fileInput) {
        fileInput.value = '';
      }
      console.log('Component state reset.');
  }


  rotateImage(degrees: number): void {
    if (this.cropper) {
      this.cropper.rotate(degrees);
      // Re-enable centering if desired after rotation
      // this.cropper.center();
      console.log(`Rotated image by ${degrees} degrees.`);
    }
  }

  zoomIn(): void {
    if (this.cropper) {
      this.cropper.zoom(0.1);
      // Re-enable centering if desired after zoom
      // this.cropper.center();
      console.log('Zoomed in.');
    }
  }

  zoomOut(): void {
    if (this.cropper) {
      this.cropper.zoom(-0.1);
      // Re-enable centering if desired after zoom
      // this.cropper.center();
       console.log('Zoomed out.');
    }
  }

  resetCropper(): void {
    if (this.cropper) {
      this.cropper.reset();

      setTimeout(() => {
        if (this.cropper) {
           // --- MODIFIED: Set crop box size based on percentage after reset ---
           const canvasData = this.cropper.getCanvasData();

           const cropBoxWidth = canvasData.width * this.INITIAL_CROP_AREA_PERCENTAGE;
           const cropBoxHeight = canvasData.height * this.INITIAL_CROP_AREA_PERCENTAGE;

           const cropBoxData = {
              width: cropBoxWidth,
              height: cropBoxHeight,
               // Center the crop box within the canvas
              left: canvasData.left + (canvasData.width - cropBoxWidth) / 2,
              top: canvasData.top + (canvasData.height - cropBoxHeight) / 2,
           };

           this.cropper.setCropBoxData(cropBoxData);

           // Ensure drag mode is 'crop' after reset
           this.cropper.setDragMode('crop');

           // Re-enable centering if desired after reset
           // this.cropper.center();

           console.log('Cropper reset and initial crop box size set.');
        }
      }, 100);
    }
  }

  onCropImage(): void {
    if (this.cropper) {
      // getCroppedCanvas uses the current crop box size and position
      // to determine which part of the image to crop.
      // The width and height options here specify the output dimensions.
      this.croppedImage.set(this.cropper.getCroppedCanvas({
        width: this.CROP_SIZE.width, // Output width 500px
        height: this.CROP_SIZE.height, // Output height 500px
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }).toDataURL('image/jpeg', 0.9));
      console.log('Image cropped and preview updated.');
    } else {
        console.warn('Cropper not initialized. Cannot crop.');
    }
  }

  onSubmitImage(): void {
    if (!this.croppedImage()) {
      this.imageError.set('Please apply crop before saving.');
      return;
    }

    console.log('Cropped image data URL ready for submission:');
    console.log(this.croppedImage());
    alert('Image saved successfully (check console for data URL)');
  }
}