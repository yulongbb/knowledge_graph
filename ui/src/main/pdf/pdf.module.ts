import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PdfRoutesModule } from "./pdf-routes.module";
import { PdfComponent } from "./pdf.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { XDrawerModule, XPageHeaderModule, XRadioModule } from "@ng-nest/ui";
import { XUploadModule } from '@ng-nest/ui/upload';
import { XImageModule } from '@ng-nest/ui/image';
import { XStatisticModule } from '@ng-nest/ui/statistic';
import { XPaginationModule } from '@ng-nest/ui/pagination';
import { PdfDetailComponent } from "./pdf-detail/pdf-detail.component";



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
    XPaginationModule,
    XRadioModule,
    PdfRoutesModule
  ],
  declarations: [PdfComponent, PdfDetailComponent]
})
export class PdfModule { }
