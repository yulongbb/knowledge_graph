import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TypeRoutesModule } from "./type-routes.module";
import { TypeComponent } from "./type.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';


@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    TypeRoutesModule
  ],
  declarations: [TypeComponent]
})
export class TypeModule { }
