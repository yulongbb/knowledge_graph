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



@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    XInputModule,
    FusionRoutesModule
  ],
  declarations: [FusionComponent]
})
export class FusionModule {}
