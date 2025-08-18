import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { 
  XButtonModule, 
  XInputModule, 
  XTableModule, 
  XCardModule,
  XFormModule,
  XLoadingModule,
  XMessageModule
} from '@ng-nest/ui';
import { SceneComponent } from './scene.component';
import { NamespaceDetailComponent } from './namespace-detail/namespace-detail.component';

const routes = [
  { path: '', component: SceneComponent, data: { title: '命名空间管理' } },
    { path: ':type', component: NamespaceDetailComponent },
  { path: ':type/:id', component: NamespaceDetailComponent }
];

@NgModule({
  declarations: [SceneComponent, NamespaceDetailComponent,
  ],
  imports: [ 
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XButtonModule,
    XInputModule,
    XTableModule,
    XCardModule,
    XFormModule,
    XLoadingModule,
    XMessageModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SceneModule {}
