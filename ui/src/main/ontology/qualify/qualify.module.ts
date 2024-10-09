import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { QualifyRoutesModule } from "./qualify-routes.module";
import { QualifyComponent } from "./qualify.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { QualifyDetailComponent } from "./qualify-detail/qualify-detail.component";
import { XInputModule } from "@ng-nest/ui";



@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    XInputModule,
    AuAdaptionModule,
    QualifyRoutesModule
  ],
  declarations: [QualifyComponent, QualifyDetailComponent]
})
export class QualifyModule {}
