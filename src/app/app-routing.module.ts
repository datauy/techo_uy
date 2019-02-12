import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapComponent } from './map/map.component';
import { MethodologyComponent } from './methodology/methodology.component';
import { ContactComponent } from './contact/contact.component';
import { PressRoomComponent } from './press-room/press-room.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'methodology', component: MethodologyComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'press-room', component: PressRoomComponent },
  { path: '', redirectTo: '/map', pathMatch: 'full'},
  { path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
