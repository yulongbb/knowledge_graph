import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OntologyPropertiesComponent } from './ontology-properties/ontology-properties.component';
import { OntologyComponent } from './ontology.component';
import { PropertyDetailComponent } from './property-detail/property-detail.cimponent';


const routes: Routes = [
  { path: '', component: OntologyComponent },
  { path: 'properties/:schemaId', component: OntologyPropertiesComponent },
  { path: 'properties/:schemaId/:type', component: PropertyDetailComponent },
  { path: 'properties/:schemaId/:type/:id', component: PropertyDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OntologyRoutesModule {}
