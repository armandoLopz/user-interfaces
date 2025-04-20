import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css'; // Import Cropper CSS
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { ImageService } from '../../services/multimedia/image.service';
import { ImageInterface } from '../../interfaces/interfaces.models'; // Assuming you have an ImageInterface
import { catchError } from 'rxjs/operators'; // Import catchError for error handling
import { of } from 'rxjs'; // Import 'of' to return an observable in catchError


@Component({
  selector: 'app-images',
  standalone: true,
  imports: [ReactiveFormsModule], // Ensure ReactiveFormsModule is imported
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
  imageDataUrl = signal<string | null>(null); // Holds the original image data URL for cropper
  croppedImage = signal<string | null>(null); // Holds the cropped image data URL

  private cropper?: Cropper;
  private readonly MIN_WIDTH = 800;
  private readonly MIN_HEIGHT = 600;
  private readonly ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
  // This is the desired FINAL crop output size (500x500)
  private readonly CROP_SIZE = { width: 500, height: 500 };

  private readonly MIN_CROP_BOX_SIZE = { width: 50, height: 50 }; // Minimum size for the interactive crop box
  private readonly INITIAL_CROP_AREA_PERCENTAGE = 0.8; // Define desired initial size as percentage

  // --- Service URL (replace with your actual ImageService if you want to use it) ---
  // private imageUrl = url + "/image/"; // Use your ImageService if preferred

  constructor(private fb: FormBuilder, private http: HttpClient, private imageService: ImageService) { // Inject HttpClient
    this.imageForm = this.fb.group({
      title: ['', Validators.required], // Added a title form control
      image: [null, Validators.required] // File input control (value not used directly for upload)
    });
    // --- ADDED LOG --- Log form validity changes
    this.imageForm.statusChanges.subscribe(status => {
      console.log('Image Form Status Changed:', status, 'Valid:', this.imageForm.valid);
    });
    this.imageForm.get('title')?.statusChanges.subscribe(status => {
      console.log('Title Control Status Changed:', status, 'Valid:', this.imageForm.get('title')?.valid);
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
      // Clear the title when the file input is cleared
      this.imageForm.get('title')?.reset();
      return;
    }

    const file = input.files[0];

    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      this.imageError.set('Invalid file format. Only JPG, PNG, and WebP formats are allowed.');
      this.resetComponentState(); // Reset on validation error
      this.imageForm.get('title')?.reset();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < this.MIN_WIDTH || img.height < this.MIN_HEIGHT) {
          this.imageError.set(`Image dimensions are too small. Minimum required size is ${this.MIN_WIDTH}x${this.MIN_HEIGHT}px.`);
          this.resetComponentState(); // Reset on validation error
          this.imageForm.get('title')?.reset();
          return;
        }

        this.imageError.set(null);
        this.croppedImage.set(null); // Clear previous cropped image
        this.imageDataUrl.set(e.target.result); // Set original image data URL
        console.log('Image dimensions valid. Setting imageDataUrl.');
        // The @ViewChild setter will handle cropper setup

      };
      img.onerror = () => {
        this.imageError.set('Failed to load image.');
        this.resetComponentState(); // Reset on image load error
        this.imageForm.get('title')?.reset();
      }
      img.src = e.target.result; // Set src to trigger img.onload or img.onerror
    };
    reader.onerror = () => {
      this.imageError.set('Failed to read file.');
      this.resetComponentState(); // Reset on file read error
      this.imageForm.get('title')?.reset();
    };
    reader.readAsDataURL(file); // Read file as Data URL
  }

  private dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  private setupCropper(): void {
    // Ensure the image element is available via the setter
    if (!this._cropperImageElement || !this._cropperImageElement.nativeElement) {
      console.error('Cropper image element not found for setup.');
      return;
    }

    // Destroy previous cropper instance if it exists
    this.destroyCropper();

    const imageElement = this._cropperImageElement.nativeElement;

    // Initialize Cropper.js with proper configuration
    this.cropper = new Cropper(imageElement, {
      // aspectRatio: 1, // Keep commented if you want a free aspect ratio for the initial crop box
      viewMode: 1,    // Restrict the crop box to not exceed the size of the canvas
      dragMode: 'crop', // Default drag mode is crop

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

          // --- Manually set initial crop box size based on percentage ---
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
    if (fileInput) {
      fileInput.value = '';
    }
    // Do NOT reset the title here if you want to keep it when changing image before saving
    // this.imageForm.get('title')?.reset(); // Keep title value unless file input is cleared
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
      // Zoom by a relative ratio (e.g., 10%)
      this.cropper.zoom(0.1);
      // Re-enable centering if desired after zoom
      // this.cropper.center();
      console.log('Zoomed in.');
    }
  }

  zoomOut(): void {
    if (this.cropper) {
      // Zoom by a relative ratio (e.g., -10%)
      this.cropper.zoom(-0.1);
      // Re-enable centering if desired after zoom
      // this.cropper.center();
      console.log('Zoomed out.');
    }
  }

  resetCropper(): void {
    if (this.cropper) {
      this.cropper.reset();

      // Reset to our desired crop box size and position after reset
      // Small delay to ensure reset is complete and canvas/container data is updated
      setTimeout(() => {
        if (this.cropper) {
          // Manually set initial crop box size based on percentage after reset
          const canvasData = this.cropper.getCanvasData();
          const initialCropBoxWidth = canvasData.width * this.INITIAL_CROP_AREA_PERCENTAGE;
          const initialCropBoxHeight = canvasData.height * this.INITIAL_CROP_AREA_PERCENTAGE;

          this.cropper.setCropBoxData({
            left: (canvasData.width - initialCropBoxWidth) / 2 + canvasData.left, // center horizontally
            top: (canvasData.height - initialCropBoxHeight) / 2 + canvasData.top,  // center vertically
            width: initialCropBoxWidth,
            height: initialCropBoxHeight,
          });


          // Ensure drag mode is 'crop' after reset
          this.cropper.setDragMode('crop');

          // Re-enable centering if desired after reset
          // this.cropper.center();

          console.log('Cropper reset and initial crop box size set.');
        }
      }, 100); // Adjust delay if needed, but 100ms is usually safe
    }
  }

  onCropImage(): void {
    if (this.cropper) {
      // Get the cropped canvas with the FINAL desired dimensions
      // Use 'image/jpeg' for .jpg output, quality 0-1
      this.croppedImage.set(this.cropper.getCroppedCanvas({
        width: this.CROP_SIZE.width,
        height: this.CROP_SIZE.height,
        fillColor: '#fff', // Fill transparent areas with white
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }).toDataURL('image/jpeg', 0.9)); // Output as JPEG with 90% quality

      this.imageForm.get('image')?.patchValue(this.croppedImage);

    } else {
      console.warn('Cropper not initialized. Cannot crop.');
    }
  }

  // ... después de tu método onCropImage() ..Value:', this.imageForm.get('title')?.value, 'Image Control Valid:', this.imageForm.get('image')?.valid) Value:', this.imageForm.get('title')?.value, 'Image Control Valid:', this.imageForm.get('image')?.valid)

  // --- Asegúrate de que la función auxiliar dataURLtoBlob esté en tu componente ---
/*
private dataURLtoBlob(dataurl: string): Blob {
    // ... implementación de la función ...
}
*/

// --- Asegúrate de que HttpClient esté inyectado: constructor(..., private http: HttpClient, ...) ---
// --- Asegúrate de tener la URL de la API definida: private readonly API_URL = url + "/image/"; ---
// --- Asegúrate de tener importados catchError y finalize ---

onSubmitImage(): void {
  console.log('Attempting to submit image...');
  // --- LOG DE DEPURACIÓN --- Log estado actual al intentar enviar
  console.log('>>>> DEPURACION: Current state - croppedImage:', this.croppedImage() ? 'Set (as Data URL)' : 'Not Set', 'Form Valid:', this.imageForm.valid, 'Title Value:', this.imageForm.get('title')?.value, 'Image Control Valid:', this.imageForm.get('image')?.valid);


 // Verifica que el formulario completo es válido (incluyendo título y control 'image')
 if (this.imageForm.invalid) {
   console.warn('>>>> DEPURACION: Form is invalid. Cannot submit.');
   this.imageError.set('Please provide a title for the image and select a valid file.');
   this.imageForm.get('title')?.markAsTouched();
   this.imageForm.get('image')?.markAsTouched();
   return;
 }

  // Verifica que tenemos la Data URL de la imagen recortada
 if (!this.croppedImage()) {
   console.warn('>>>> DEPURACION: No cropped image Data URL available. Cannot submit.');
   this.imageError.set('Please apply crop before saving.');
   return;
 }

 // Obtiene el título del formulario
 const imageTitle: string = this.imageForm.get('title')?.value;
 // Obtiene la Data URL de la imagen recortada
 const croppedImageDataUrlString = this.croppedImage()!; // Obtenemos el string Data URL


 // --- PASO CLAVE: Convertir la Data URL a Blob ---
 let imageBlob: Blob;
 try {
   imageBlob = this.dataURLtoBlob(croppedImageDataUrlString);
   console.log('>>>> DEPURACION: Converted Data URL to Blob:', imageBlob);
 } catch (e) {
   console.error('>>>> DEPURACION: Failed to convert Data URL to Blob:', e);
   this.imageError.set('Error preparing image for upload.');
   return;
 }

 // --- Crear un objeto FormData ---
 const formData = new FormData();
 // Añadir el título al FormData
 formData.append('title', imageTitle);
 // Añadir el Blob de la imagen al FormData. 'image' debe coincidir con el nombre del campo que espera tu API.
 // El tercer argumento es el nombre de archivo que se enviará.
 const mimeType = imageBlob.type; // ej: 'image/jpeg'
 const fileExtension = mimeType.split('/')[1]; // ej: 'jpeg'
 const filename = `cropped_image.${fileExtension}`; // ej: 'cropped_image.jpeg'

 formData.append('image', imageBlob, filename);

  console.log('>>>> DEPURACION: Created FormData. Appended title and image blob.');


 // --- Enviar el FormData usando HttpClient directo ---
 // Tu ImageService.postimage(ImageInterface) no es compatible con FormData.
 // Usa HttpClient directo o modifica tu servicio para aceptar FormData.
 this.http.post<any>("http://127.0.0.1:8000/api/images/", formData) // <<< Enviando FormData. Usa <any> o el tipo de respuesta esperado si no es ImageInterface.
   .pipe(
     catchError(error => {
       console.error('>>>> DEPURACION: Error uploading image:', error);
        // Intenta leer un mensaje de error del backend
       const errorMessage = error.error && error.error.message ? error.error.message : 'Failed to upload image. Please try again.';
       this.imageError.set(errorMessage);
       return of(undefined);
     }),
   )
   .subscribe(response => {
     if (response) {
        console.log('>>>> DEPURACION: Image uploaded successfully:', response);
        alert('Image saved successfully!');
        this.imageForm.reset();
        this.resetComponentState();
        this.imageError.set(null); // Limpiar errores mostrados
     }
   });
}
}