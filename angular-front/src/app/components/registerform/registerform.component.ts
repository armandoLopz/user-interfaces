import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registerform',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registerform.component.html',
  styleUrl: './registerform.component.css'
})
export class RegisterformComponent {
  
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      descripcion: [''],
      sitioPersonal: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Formulario enviado:', this.registerForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }

}
