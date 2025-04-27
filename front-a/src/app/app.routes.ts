import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/forms/loginform/login.form/login.form.component';
import { PersonalInfoComponent } from './components/forms/registerforms/personal-info/personal-info.component';
import { SkillsComponent } from './components/forms/registerforms/skills/skills.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { HPageComponent } from './pages/h-page/h-page.component';
import { MultimediaPageComponent } from './pages/multimedia-page/multimedia-page.component';
import { MULTIMEDIA_PAGE_ROUTE, LOGIN_ROUTE, HOME_PAGE_ROUTE, PERSONAL_INFO_FORM_ROUTE, SKILLS_FORM_ROUTE, PROFILE_PAGE_ROUTE, ADMIN_PAGE_ROUTE, SETTING_PAGE_ROUTE } from './app.routes.constans';
import { RegisterReactiveFormComponent } from './components/forms/registerforms/register-reactive-form/register-reactive-form.component';

export const routes: Routes = [
    
    {path: LOGIN_ROUTE, component: LoginFormComponent},
    {path: PERSONAL_INFO_FORM_ROUTE, component: RegisterReactiveFormComponent},
    {path: SKILLS_FORM_ROUTE, component: SkillsComponent},
    {path: PROFILE_PAGE_ROUTE, component: ProfilePageComponent},
    {path: SETTING_PAGE_ROUTE, component: SettingsPageComponent},
    {path: HOME_PAGE_ROUTE, component: HPageComponent},
    {path: MULTIMEDIA_PAGE_ROUTE, component: MultimediaPageComponent}
];
