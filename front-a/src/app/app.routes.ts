import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/forms/loginform/login.form/login.form.component';
import { PersonalInfoComponent } from './components/forms/registerforms/personal-info/personal-info.component';
import { SkillsComponent } from './components/forms/registerforms/skills/skills.component';

import { LOGIN_ROUTE, PERSONAL_INFO_FORM_ROUTE, SKILLS_FORM_ROUTE } from './app.routes.constans';

export const routes: Routes = [
    
    {path: LOGIN_ROUTE, component: LoginFormComponent},
    {path: PERSONAL_INFO_FORM_ROUTE, component: PersonalInfoComponent},
    {path: SKILLS_FORM_ROUTE, component: SkillsComponent}
];
