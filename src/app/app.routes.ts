import { Routes } from '@angular/router';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreatePlanteComponent } from './components/create-plante/create-plante.component';
import { PlanteListComponent } from './components/plante-list/plante-list.component';
import { ProgrammeArrosageComponent } from './components/programme-arrosage/programme-arrosage.component';
import { ListeProgrammesComponent } from './components/liste-programmes/liste-programmes.component';

export const routes: Routes = [
  {path: '',component: AddUserComponent},
  { path: 'users', component: UserListComponent },
  { path: 'new-plante', component: CreatePlanteComponent },
  { path: 'plantes', component: PlanteListComponent },
  { path: 'programme', component: ProgrammeArrosageComponent },
  { path: 'programmeListe', component: ListeProgrammesComponent },
];
