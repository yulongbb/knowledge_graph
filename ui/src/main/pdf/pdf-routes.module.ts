import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfComponent } from './pdf.component';
import { PdfDetailComponent } from './pdf-detail/pdf-detail.component';

const routes: Routes = [
  { path: '', component: PdfComponent },
  { path: ':type', component: PdfDetailComponent },
  { path: ':type/:id', component: PdfDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdfRoutesModule {}
