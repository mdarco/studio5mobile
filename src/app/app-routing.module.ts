import { NgModule } from '@angular/core';
import { Routes, RouterModule, mapToCanActivate } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserAuthenticatedGuardService } from './services/auth-guards/authenticated/user-authenticated-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(x => x.LoginPageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(x => x.ListPageModule),
    canActivate: mapToCanActivate([UserAuthenticatedGuardService])
  },
  {
    path: 'list/:id',
    loadChildren: () => import('./member/member.module').then(x => x.MemberPageModule),
    canActivate: mapToCanActivate([UserAuthenticatedGuardService])
  },
  {
    path: 'trainings',
    loadChildren: () => import('./trainings/trainings.module').then(x => x.TrainingsPageModule),
    canActivate: mapToCanActivate([UserAuthenticatedGuardService])
  },
  { 
    path: 'trainings/:id/member-presence',
    loadChildren: () => import('./trainings-member-presence/trainings-member-presence.module').then(x => x.TrainingsMemberPresencePageModule),
    canActivate: mapToCanActivate([UserAuthenticatedGuardService])
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
