import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityComponent } from './entity.component';
import { EntityDetailComponent } from './entity-detail/entity-detail.component';
import { EntityGridComponent } from './entity-grid/entity-grid.component';

const routes: Routes = [
  { path: '', component: EntityComponent },
  { path: 'grid', component: EntityGridComponent },
  { path: ':type', component: EntityDetailComponent },
  { path: ':type/:id', component: EntityDetailComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntityRoutesModule {}
