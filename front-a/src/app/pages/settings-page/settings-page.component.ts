import { Component } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';

@Component({
  selector: 'app-settings-page',
  imports: [SideBarComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {

  primaryColor: string = '#000000';
  secondaryColor: string = '#000000';
  accentColor: string = '#000000';
  sizeParagraph: string = '16px';
  sizeTitle: string = '24px';
  sizeSubtitle: string = '20px';
  primaryFont: string = 'None';
  secondaryFont: string = 'None';

  extraColor1: string = '#ffffff';
  extraColor2: string = '#000000';

  primaryFontTitle = "Title"
  secondaryFontTitle = "Subtitle"

  // Función para restaurar los valores por defecto
  restoreDefaults() {
    this.primaryColor = '#000000';
    this.secondaryColor = '#000000';
    this.accentColor = '#000000';
    this.sizeParagraph = '16px';
    this.sizeTitle = '24px';
    this.sizeSubtitle = '20px';
    this.primaryFont = 'None';
    this.secondaryFont = 'None';
    this.extraColor1 = '#ffffff';
    this.extraColor2 = '#000000';
  }
  
  onColorChange(event: Event, colorType: string) {
    const input = event.target as HTMLInputElement;
    if (input) {
      const value = input.value;
      switch (colorType) {
        case 'primary':
          this.primaryColor = value;
          break;
        case 'secondary':
          this.secondaryColor = value;
          break;
        case 'accent':
          this.accentColor = value;
          break;
        case 'extra1':
          this.extraColor1 = value;
          break;
        case 'extra2':
          this.extraColor2 = value;
          break;
      }
    }
  }

  onSizeChange(event: Event, sizeType: string) {
    const input = event.target as HTMLInputElement;
    if (input) {
      const value = input.value || '16px'; // Default size
      switch (sizeType) {
        case 'paragraph':
          this.sizeParagraph = value + 'px';
          break;
        case 'title':
          this.sizeTitle = value + 'px';
          break;
        case 'subtitle':
          this.sizeSubtitle = value + 'px';
          break;
      }
    }
  }

  // Función para manejar el cambio de fuente
  onFontChange(event: Event, fontType: string) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];

      // Crear un objeto FileReader para leer el archivo
      const reader = new FileReader();
      
      // Cuando el archivo se haya leído, aplicamos la fuente
      reader.onload = (e: any) => {
        const fontUrl = e.target.result;  // Obtenemos la URL de datos del archivo

        // Creamos un nuevo estilo CSS para la fuente
        const fontName = file.name.split('.')[0];  // Nombre de la fuente (sin la extensión)
        const style = document.createElement('style');
        style.innerHTML = `
          @font-face {
            font-family: '${fontName}';
            src: url('${fontUrl}') format('truetype');
          }
        `;
        document.head.appendChild(style);  // Añadimos el estilo al documento

        // Actualizamos la fuente seleccionada en el estado del componente
        if (fontType === 'primary') {
          this.primaryFont = fontName;
        } else if (fontType === 'secondary') {
          this.secondaryFont = fontName;
        }
      };

      // Leemos el archivo como URL de datos
      reader.readAsDataURL(file);
    }
  }

}
