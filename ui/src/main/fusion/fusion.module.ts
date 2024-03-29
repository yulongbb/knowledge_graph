import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FusionRoutesModule } from "./fusion-routes.module";
import { FusionComponent } from "./fusion.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { FusionEntityComponent } from "./fusion-entity/fusion-entity.component";
import { FusionItemComponent } from "./fusion-item/fusion-item.component";
import { FusionPropertyComponent } from "./fusion-property/fusion-property.component";
import { FusionValueComponent } from "./fusion-value/fusion-value.component";
import { XDrawerModule } from "@ng-nest/ui";
import { PropertyPipe } from "src/pipes/property.pipe";
import { FusionDetailComponent } from "./fusion-detail/fusion-detail.component";



@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    XInputModule,
    XDrawerModule,
    FusionRoutesModule
  ],
  declarations: [FusionComponent, FusionDetailComponent,FusionEntityComponent, FusionItemComponent, FusionPropertyComponent, FusionValueComponent,PropertyPipe]
})
export class FusionModule {}
