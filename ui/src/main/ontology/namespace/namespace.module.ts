import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { XButtonModule, XInputModule, XSelectModule, XTabsModule, XTagModule, XTreeModule } from '@ng-nest/ui';
import { XListModule } from '@ng-nest/ui/list';
import { XTableModule } from '@ng-nest/ui/table';
import { XCardModule } from '@ng-nest/ui/card';
import { XCrumbModule } from '@ng-nest/ui/crumb';
import { NamespaceRoutesModule } from './namespace-routes.module';
import { NamespaceComponent } from './namespace.component';
import { OntologyTreeComponent } from './ontology-tree/ontology-tree.component';
import { OntologyModule } from '../ontology/ontology.module';
import { PropertyModule } from '../property/property.module';
import { QualifyModule } from '../qualify/qualify.module';
import { TagModule } from '../tag/tag.module';

@NgModule({
  declarations: [
    NamespaceComponent, 
    OntologyTreeComponent
  ],
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    XInputModule,
    XSelectModule,
    XListModule,
    XTableModule,
    XCardModule,
    XCrumbModule,
    XTagModule,
    XTabsModule,
    XButtonModule,
    NamespaceRoutesModule,
    OntologyModule,
    PropertyModule,
    QualifyModule,
    TagModule
  ],
  exports: [RouterModule],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NamespaceModule {}
