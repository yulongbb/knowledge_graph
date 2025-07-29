import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OntologyRoutesModule } from "./ontology-routes.module";
import { OntologyComponent } from "./ontology.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XTagModule } from '@ng-nest/ui/tag';
import { NamespaceComponent } from "./namespace/namespace.component";
import { OntologyTreeComponent } from "./namespace/ontology-tree/ontology-tree.component";


@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    XTagModule,
    OntologyRoutesModule
  ],
  declarations: [OntologyComponent,NamespaceComponent,OntologyTreeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OntologyModule { }
