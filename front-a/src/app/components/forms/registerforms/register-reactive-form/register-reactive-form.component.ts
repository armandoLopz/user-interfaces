import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { customStringEmptyValidator } from '../../../../utils/customValidators';
import { ApiUserService } from '../../../../services/user/api.user.service';
import { userInterface } from '../../../../interfaces/interfaces.models';
import { Router } from '@angular/router';
import { LOGIN_ROUTE } from '../../../../app.routes.constans';

@Component({
  selector: 'app-register-reactive-form',
  imports: [ReactiveFormsModule],
  templateUrl: './register-reactive-form.component.html',
  styleUrl: './register-reactive-form.component.css'
})
export class RegisterReactiveFormComponent {

  private formBuilder = inject(FormBuilder);
  private userService = inject(ApiUserService);
  private router = inject(Router)
  private loginURL: string = LOGIN_ROUTE
  protected formSubmitted = false;

  private user: userInterface = {

    first_name: '',
    last_name: '',
    email: '',
    cellphone: '',
    password: '',
    username: '',

  }

  userForm = this.formBuilder.nonNullable.group({

    name: ['', [Validators.required, customStringEmptyValidator] ],
    lastname: ['', [Validators.required, customStringEmptyValidator]],
    email: ['', [Validators.required, Validators.email]],
    cellphone: ['', [Validators.required, customStringEmptyValidator]],
    username: ['', [Validators.required, customStringEmptyValidator]],
    password: ['', Validators.required]

  })

  ngOnInit(): void { }

  onSubmit() {
    this.formSubmitted = true; // Establece formSubmitted en true cuando se envía el formulario

    if (this.userForm.valid) {
      
      this.user.first_name = this.userForm.controls.name.value
      this.user.last_name = this.userForm.controls.lastname.value
      this.user.email = this.userForm.controls.email.value
      this.user.cellphone = this.userForm.controls.cellphone.value
      this.user.username = this.userForm.controls.username.value
      this.user.password = this.userForm.controls.password.value

      try {
        
        this.userService.postUserData(this.user).subscribe({

          next: (res) => {

            alert("usuario creado exitosamente")
            this.router.navigateByUrl(this.loginURL)
          },
          error: (err) => {

            console.log("error al crear el usuario" + err);
            
          }

        })
      } catch (error) {
        
        console.log("error procesando la solicitud " + error);
        
      }
    }
  }

  //Getters user form

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

  getCellphone(): FormControl<string>{

    return this.userForm.controls.cellphone
  }
  
  getPassword(): FormControl<string>{

    return this.userForm.controls.password;
  }
}
