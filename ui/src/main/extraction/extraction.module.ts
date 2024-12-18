import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExtractionRoutesModule } from "./extraction-routes.module";
import { ExtractionComponent } from "./extraction.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { ExtractionDetailComponent } from "./extraction-detail/extraction-detail.component";
import { XTextareaModule } from '@ng-nest/ui/textarea';
import { XCheckboxModule, XInputModule, XProgressModule, XTransferModule } from "@ng-nest/ui";
import { PropertyDetailComponent } from "./property-detail/property-detail.component";
import { XStepsModule } from '@ng-nest/ui/steps';
import { XTabsModule } from '@ng-nest/ui/tabs';
import { EntityDetailComponent } from "./entity-detail/entity-detail.component";





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
  declarations: [ExtractionComponent,ExtractionDetailComponent,PropertyDetailComponent, EntityDetailComponent]
})
export class ExtractionModule {}
