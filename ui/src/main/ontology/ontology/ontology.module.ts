import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OntologyRoutesModule } from "./ontology-routes.module";
import { OntologyComponent } from "./ontology.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { OntologyPropertiesComponent } from "./ontology-properties/ontology-properties.component";
import { PropertyDetailComponent } from "./property-detail/property-detail.component";


@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    OntologyRoutesModule
  ],
  declarations: [OntologyComponent, OntologyPropertiesComponent, PropertyDetailComponent]
})
export class OntologyModule { }
