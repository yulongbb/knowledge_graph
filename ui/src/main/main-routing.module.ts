import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ...existing code...

const routes: Routes = [
  // ...existing code...
  {
    path: 'ontology/namespace',
    loadChildren: () => import('./ontology/namespace/namespace.module').then(m => m.NamespaceModule)
  },
  // ...existing code...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }