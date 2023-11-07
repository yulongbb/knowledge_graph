import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FusionComponent } from './fusion.component';
import { FusionEntityComponent } from './fusion-entity/fusion-entity.component';
import { FusionItemComponent } from './fusion-item/fusion-item.component';
import { FusionPropertyComponent } from './fusion-property/fusion-property.component';
import { FusionValueComponent } from './fusion-value/fusion-value.component';

const routes: Routes = [
  { path: '', component: FusionComponent },
  { path: 'entity', component: FusionEntityComponent },
  { path: 'property', component: FusionPropertyComponent },
  { path: 'value', component: FusionValueComponent },
  { path: 'item/:id', component: FusionItemComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FusionRoutesModule {}
