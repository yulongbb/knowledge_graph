import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EntityRoutesModule } from "./entity-routes.module";
import { EntityComponent } from "./entity.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { XCheckboxModule, XCollapseModule, XDatePickerModule, XDrawerModule, XInputNumberModule, XMenuModule, XPageHeaderModule, XSwitchModule, XTagModule, XTextareaModule } from "@ng-nest/ui";
import { XUploadModule } from '@ng-nest/ui/upload';
import { XImageModule } from '@ng-nest/ui/image';
import { XStatisticModule } from '@ng-nest/ui/statistic';
import { XRadioModule } from '@ng-nest/ui/radio';
import { XPaginationModule } from '@ng-nest/ui/pagination';
import { XDialogModule } from '@ng-nest/ui/dialog';
import { LeafletModule } from '@bluehalo/ngx-leaflet';






import { EntityGridComponent } from "./entity-grid/entity-grid.component";



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
    XStatisticModule,
    XImageModule,
    XRadioModule,
    XPaginationModule,
    XDialogModule,
    XTagModule,
    XMenuModule,
    XTextareaModule,
    XCheckboxModule,
    XSwitchModule,
    XCollapseModule,
    XDatePickerModule,
    XInputNumberModule,
    EntityRoutesModule,
    LeafletModule
  ],
  declarations: [EntityComponent,  EntityGridComponent]
})
export class EntityModule { }
