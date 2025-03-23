import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { customStringEmptyValidator } from '../../../../utils/customValidators';

@Component({
  selector: 'app-register-reactive-form',
  imports: [ReactiveFormsModule],
  templateUrl: './register-reactive-form.component.html',
  styleUrl: './register-reactive-form.component.css'
})
export class RegisterReactiveFormComponent {

  private formBuilder = inject(FormBuilder);

  userForm = this.formBuilder.nonNullable.group({

    name: ['', [Validators.required, customStringEmptyValidator] ],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', Validators.required]

  })

  formSubmitted = false; // Inicializa formSubmitted en false

  constructor() { }

  ngOnInit(): void { }

  onSubmit() {
    this.formSubmitted = true; // Establece formSubmitted en true cuando se envía el formulario
    console.log(this.getname().errors);
    
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }

  //Getter user form

  getname(): FormControl<string>{

    return this.userForm.controls.name;
  }

  getLastname(): FormControl<string>{

    return this.userForm.controls.lastname;
  }

  getEmail(): FormControl<string>{

    return this.userForm.controls.email;
  }

  getUsername(): FormControl<string>{

    return this.userForm.controls.username;
  }

  getPassword(): FormControl<string>{

    return this.userForm.controls.password;
  }
}
