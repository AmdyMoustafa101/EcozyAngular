import { Routes } from '@angular/router';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreatePlanteComponent } from './components/create-plante/create-plante.component';
import { PlanteListComponent } from './components/plante-list/plante-list.component';
import { AuthentificationComponent } from './authentification/authentification.component';

export const routes: Routes = [

  {path: '', redirectTo: 'auth/login', pathMatch: 'full'},
  {path: 'auth/login', component: AuthentificationComponent},
  { path: 'add-user', component: AddUserComponent },
  { path: 'users', component: UserListComponent },
  { path: 'new-plante', component: CreatePlanteComponent },
  { path: 'plantes', component: PlanteListComponent },

];