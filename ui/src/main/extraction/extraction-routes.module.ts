import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExtractionComponent } from './extraction.component';
import { ExtractionDetailComponent } from './extraction-detail/extraction-detail.component';


const routes: Routes = [
  { path: '', component: ExtractionComponent, data: { title: 'extraction' } },
  { path: ':type', component: ExtractionDetailComponent },
  { path: ':type/:id', component: ExtractionDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtractionRoutesModule {}
