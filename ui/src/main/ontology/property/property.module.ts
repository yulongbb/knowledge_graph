import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PropertyRoutesModule } from "./property-routes.module";
import { PropertyComponent } from "./property.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { PropertyDetailComponent } from "./property-detail/property-detail.component";


@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    PropertyRoutesModule
  ],
  declarations: [PropertyComponent, PropertyDetailComponent]
})
export class PropertyModule {}
