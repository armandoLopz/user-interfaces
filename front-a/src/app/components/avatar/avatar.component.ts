import { Component, signal, ViewChild, ElementRef } from '@angular/core';

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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.userImage.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  removeImage() {
    if (confirm('Are you sure you want to remove your avatar?')) {
      this.userImage.set(null);
    }
  }
}
