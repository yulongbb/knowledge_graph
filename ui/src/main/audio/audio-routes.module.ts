import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioComponent } from './audio.component';
import { AudioDetailComponent } from './audio-detail/audio-detail.component';

const routes: Routes = [
  { path: '', component: AudioComponent },
  { path: ':type', component: AudioDetailComponent },
  { path: ':type/:id', component: AudioDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AudioRoutesModule {}
