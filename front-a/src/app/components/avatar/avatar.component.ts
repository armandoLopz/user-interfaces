import { Component, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { ApiUserService } from '../../services/user/api.user.service';
import { getUserIdFromToken } from '../../utils/getToken';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent {

  defaultImage = 'assets/profile-icon-design-free-vector.jpg';
  userImage = signal<string | null>(null);
  userId: number | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private apiUserService: ApiUserService) {
    this.userId = getUserIdFromToken();
    if (this.userId) {
      this.apiUserService.getDataUserById(this.userId).subscribe({
        next: (data) => {
          this.userImage.set(data.profile_picture || null);
        },
        error: () => {
          this.userImage.set(null);
        }
      });
    }
  }

  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.userImage.set(base64);
      this.updateImage(base64);
    };
    reader.readAsDataURL(file);
  }

  updateImage(image: string) {
    if (!this.userId) return;

    const dataToUpdate = {
      id: this.userId,
      profile_picture: image
    };

    this.apiUserService.updateUserData(dataToUpdate).subscribe({
      next: () => console.log('Image updated successfully'),
      error: (err) => console.error('Error updating image:', err)
    });
  }

  removeImage() {
    if (confirm('Are you sure you want to remove your avatar?') && this.userId) {
      this.userImage.set(null);

      const dataToUpdate = {
        id: this.userId,
        profile_picture: null
      };

      this.apiUserService.updateUserData(dataToUpdate).subscribe({
        next: () => console.log('Image removed successfully'),
        error: (err) => console.error('Error removing image:', err)
      });
    }
  }
}
