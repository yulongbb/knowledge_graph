import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityComponent } from './entity.component';
import { EntityDetailComponent } from './entity-detail/entity-detail.component';

const routes: Routes = [
  { path: '', component: EntityComponent },
  { path: ':type', component: EntityDetailComponent },
  { path: ':type/:id', component: EntityDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityRoutesModule {}
