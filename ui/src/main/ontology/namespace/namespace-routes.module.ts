import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NamespaceDetailComponent } from './namespace-detail/namespace-detail.component';
import { NamespaceComponent } from './namespace.component';

const routes: Routes = [
  { path: '', component: NamespaceComponent, data: { title: 'namespaces' } },
  { path: ':type', component: NamespaceDetailComponent },
  { path: ':type/:id', component: NamespaceDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NamespaceRoutesModule {}
