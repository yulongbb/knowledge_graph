import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExtractionComponent } from './extraction.component';


const routes: Routes = [
  { path: '', component: ExtractionComponent, data: { title: 'extraction' } },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtractionRoutesModule {}
