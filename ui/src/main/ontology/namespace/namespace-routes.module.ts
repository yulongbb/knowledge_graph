import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NamespaceComponent } from './namespace.component';

const routes: Routes = [
  { path: '', component: NamespaceComponent, data: { title: 'namespaces' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NamespaceRoutesModule {}
