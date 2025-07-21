import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OntologyComponent } from './ontology.component';


const routes: Routes = [
  { path: '', component: OntologyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OntologyRoutesModule {}
