import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExtractionRoutesModule } from "./extraction-routes.module";
import { ExtractionComponent } from "./extraction.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XTextareaModule } from '@ng-nest/ui/textarea';
import { XCheckboxModule, XInputModule, XProgressModule, XTransferModule } from "@ng-nest/ui";
import { XStepsModule } from '@ng-nest/ui/steps';
import { XTabsModule } from '@ng-nest/ui/tabs';




@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    XTextareaModule,
    XInputModule,
    XTransferModule,
    XStepsModule,
    XTabsModule,
    XCheckboxModule,
    XProgressModule,
    ExtractionRoutesModule
  ],
  declarations: [ExtractionComponent, ]
})
export class ExtractionModule {}
