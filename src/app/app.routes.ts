import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreatePlanteComponent } from './components/create-plante/create-plante.component';
import { PlanteListComponent } from './components/plante-list/plante-list.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { HistoriqueComponent } from './components/historique/historique.component';
import { DetailActionsComponent } from './components/detail-actions/detail-actions.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'plantes', component: PlanteListComponent },
      { path: 'new-plante', component: CreatePlanteComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: 'details/:userId/:entityId/:date', component: DetailActionsComponent },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./authentification/authentification.component').then(
        (m) => m.AuthentificationComponent
      ),
  },
];
