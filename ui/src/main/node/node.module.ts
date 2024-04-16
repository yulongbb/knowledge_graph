import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FusionRoutesModule } from "./node-routes.module";
import { NodeComponent } from "./node.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { XDrawerModule } from "@ng-nest/ui";
import { NodeDetailComponent } from "./node-detail/node-detail.component";



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
  declarations: [NodeComponent, NodeDetailComponent]
})
export class NodeModule {}
