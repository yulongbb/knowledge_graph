import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OntologyComponent } from './ontology.component';
import { NamespaceComponent } from './namespace/namespace.component';


const routes: Routes = [
  { path: '', component: OntologyComponent },
  { path: 'edit/:id', component: NamespaceComponent }, // 路由去掉namespace
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OntologyRoutesModule {}
