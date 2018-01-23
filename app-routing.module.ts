import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { BotsComponent } from './bots/bots.component';
 
const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' }
  , { path: 'login',     component: LoginComponent }
  , { path: 'bots',  component: BotsComponent, canActivate: [AuthGuard] }
  , { path: 'chat',   component: ChatComponent, canActivate: [AuthGuard] }
];
 
@NgModule({
  imports: [ RouterModule.forRoot(routes) ]
  , exports: [ RouterModule ]
  , declarations: []
})
export class AppRoutingModule {}