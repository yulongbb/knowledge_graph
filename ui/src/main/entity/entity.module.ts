import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FusionRoutesModule } from "./entity-routes.module";
import { EntityComponent } from "./entity.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { XDrawerModule, XPageHeaderModule } from "@ng-nest/ui";
import { XUploadModule } from '@ng-nest/ui/upload';


import { EntityDetailComponent } from "./entity-detail/entity-detail.component";



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
    XUploadModule,
    XPageHeaderModule,

    FusionRoutesModule
  ],
  declarations: [EntityComponent, EntityDetailComponent]
})
export class EntityModule { }
