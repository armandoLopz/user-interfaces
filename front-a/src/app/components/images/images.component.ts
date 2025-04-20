import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Cropper from 'cropperjs'; // Import Cropper correctly
import 'cropperjs/dist/cropper.css'; // Import Cropper CSS

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.css' // Or .scss if you are using Sass/SCSS
})
export class ImagesComponent implements AfterViewInit, OnDestroy {
  // Use a setter for the ViewChild to detect when the element is available
  private _cropperImageElement?: ElementRef<HTMLImageElement>;
  @ViewChild('cropperImageElement')
  set cropperImageElement(element: ElementRef<HTMLImageElement> | undefined) {
    this._cropperImageElement = element;
    // Initialize cropper when the image element becomes available
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
  private readonly CROP_SIZE = { width: 500, height: 500 }; // Desired crop box dimensions

  constructor(private fb: FormBuilder) {
    this.imageForm = this.fb.group({
      image: [null, Validators.required]
    });
  }

  // ngAfterViewInit is not strictly needed for cropper setup anymore
  // as the @ViewChild setter handles it.
  ngAfterViewInit(): void {
     // Any other post-view-initialization logic can go here.
     // Do NOT call setupCropper() directly here anymore.
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      // Clear previous image and cropper if file selection is cancelled
      this.resetComponentState();
      return;
    }

    const file = input.files[0];

    // Validate file format
    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      this.imageError.set('Invalid file format. Only JPG, PNG, and WebP formats are allowed.');
      this.resetComponentState(); // Reset on validation error
      return;
    }

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Create an image element in memory to check dimensions BEFORE setting the data URL
      const img = new Image();
      img.onload = () => {
        // Validate image dimensions
        if (img.width < this.MIN_WIDTH || img.height < this.MIN_HEIGHT) {
          this.imageError.set(`Image dimensions are too small. Minimum required size is ${this.MIN_WIDTH}x${this.MIN_HEIGHT}px.`);
          this.resetComponentState(); // Reset on validation error
          return;
        }

        // If valid, clear any previous errors/cropped image and set the new image data URL
        this.imageError.set(null);
        this.croppedImage.set(null);
        this.imageDataUrl.set(e.target.result); // This triggers the @if and eventually the @ViewChild setter
        console.log('Image dimensions valid. Setting imageDataUrl.');

         // DO NOT call setupCropper directly here or via setTimeout.
         // The @ViewChild setter will call it when the element is ready.
      };
      img.onerror = () => {
         this.imageError.set('Failed to load image.');
         this.resetComponentState(); // Reset on image load error
      }
      img.src = e.target.result; // Set src to trigger img.onload or img.onerror
    };
    reader.onerror = () => {
        this.imageError.set('Failed to read file.');
        this.resetComponentState(); // Reset on file read error
    };
    reader.readAsDataURL(file);
  }

  // setupCropper now initializes on the element provided by the setter
  private setupCropper(): void {
    // Ensure the image element is available via the setter
    if (!this._cropperImageElement || !this._cropperImageElement.nativeElement) {
      console.error('Cropper image element not found for setup.');
      // The @ViewChild setter should prevent this from happening if called correctly
      // but this check is good practice.
      return;
    }

    // Destroy previous cropper instance if it exists
    this.destroyCropper();

    const imageElement = this._cropperImageElement.nativeElement;

    // Initialize Cropper.js
    this.cropper = new Cropper(imageElement, {
      aspectRatio: 1, // 1:1 aspect ratio for square crop
      viewMode: 1,    // Restrict the crop box to not exceed the size of the canvas
      dragMode: 'crop', // Default drag mode is crop
      autoCropArea: 0.8, // Initial auto crop area size (0 to 1)
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
      minCropBoxWidth: this.CROP_SIZE.width,
      minCropBoxHeight: this.CROP_SIZE.height,
      ready: () => {
        if (this.cropper) {
          console.log('Cropper ready event fired');
          // Set initial crop box size to match our desired dimensions and center it
          // Use getCanvasData() or getContainerData() for positioning relative to the canvas/container
           const canvasData = this.cropper.getCanvasData();
           const cropBoxData = {
              width: this.CROP_SIZE.width,
              height: this.CROP_SIZE.height,
              left: (canvasData.width - this.CROP_SIZE.width) / 2 + canvasData.left,
              top: (canvasData.height - this.CROP_SIZE.height) / 2 + canvasData.top,
           };
           // Ensure the calculated crop box is within the canvas boundaries
           if(cropBoxData.left >= canvasData.left &&
              cropBoxData.top >= canvasData.top &&
              (cropBoxData.left + cropBoxData.width) <= (canvasData.left + canvasData.width) &&
              (cropBoxData.top + cropBoxData.height) <= (canvasData.top + canvasData.height)) {
               this.cropper.setCropBoxData(cropBoxData);
           } else {
               console.warn('Calculated crop box is outside canvas boundaries. Using autoCropArea.');
               // If calculated box is out of bounds (e.g., image is smaller than CROP_SIZE after scaling)
               // Cropper's autoCropArea will provide a fallback crop box.
           }
        }
      }
    });
     console.log('Cropper instance initialized.');
  }

  private destroyCropper(): void {
    if (this.cropper) {
      console.log('Destroying Cropper instance...');
      this.cropper.destroy();
      this.cropper = undefined; // Explicitly set to undefined
      // When imageDataUrl is set to null, the element is removed,
      // and the @ViewChild setter will be called with undefined.
    }
  }

  // Helper to reset the component state
  private resetComponentState(): void {
      console.log('Resetting component state...');
      this.destroyCropper();
      this.imageDataUrl.set(null); // This will hide the cropper view and trigger the @ViewChild setter with undefined
      this.croppedImage.set(null);
      // Reset the file input value so the same file can be selected again
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
      if(fileInput) {
        fileInput.value = '';
      }
      console.log('Component state reset.');
  }


  rotateImage(degrees: number): void {
    if (this.cropper) {
      this.cropper.rotate(degrees);
    }
  }

  zoomIn(): void {
    if (this.cropper) {
      this.cropper.zoom(0.1);
    }
  }

  zoomOut(): void {
    if (this.cropper) {
      this.cropper.zoom(-0.1);
    }
  }

  // Renamed for clarity - enables interaction with the crop box
  setCropMode(): void {
    if (this.cropper) {
      this.cropper.setDragMode('crop');
    }
  }

  // Added a method to set drag mode to 'move' - enables moving the image
  setMoveMode(): void {
     if (this.cropper) {
       this.cropper.setDragMode('move');
     }
  }

  resetCropper(): void {
    if (this.cropper) {
      this.cropper.reset();

      // Reset to our desired crop box size and position after reset
      // Small delay to ensure reset is complete and canvas data is updated
      setTimeout(() => {
        if (this.cropper) {
           const canvasData = this.cropper.getCanvasData();
           const cropBoxData = {
              width: this.CROP_SIZE.width,
              height: this.CROP_SIZE.height,
              left: (canvasData.width - this.CROP_SIZE.width) / 2 + canvasData.left,
              top: (canvasData.height - this.CROP_SIZE.height) / 2 + canvasData.top,
           };
            if(cropBoxData.left >= canvasData.left &&
              cropBoxData.top >= canvasData.top &&
              (cropBoxData.left + cropBoxData.width) <= (canvasData.left + canvasData.width) &&
              (cropBoxData.top + cropBoxData.height) <= (canvasData.top + canvasData.height)) {
               this.cropper.setCropBoxData(cropBoxData);
           } else {
               console.warn('Calculated crop box after reset is outside canvas boundaries. Not setting specific size.');
           }
           this.setCropMode(); // Ensure drag mode is back to crop after reset
        }
      }, 100);
    }
  }

  onCropImage(): void {
    if (this.cropper) {
      // Get the cropped canvas with exact dimensions we want
      this.croppedImage.set(this.cropper.getCroppedCanvas({
        width: this.CROP_SIZE.width,
        height: this.CROP_SIZE.height,
        fillColor: '#fff', // Fill transparent areas with white
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }).toDataURL('image/jpeg', 0.9)); // Output as JPEG with 90% quality
    }
  }

  onSubmitImage(): void {
    if (!this.croppedImage()) {
      this.imageError.set('Please crop the image before saving.');
      return;
    }

    // Here you would typically send the this.croppedImage() data URL
    // to your backend for storage.
    console.log('Cropped image data URL ready for submission:');
    console.log(this.croppedImage());
    // Implement your submission logic here
    alert('Image saved successfully (check console for data URL)');
    // You might want to reset the component state after submission
    // this.resetComponentState();
  }
}