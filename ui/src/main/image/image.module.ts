import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImageRoutesModule } from "./image-routes.module";
import { ImageComponent } from "./image.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XTreeModule } from '@ng-nest/ui/tree';
import { XInputModule } from '@ng-nest/ui/input';
import { XDrawerModule, XPageHeaderModule } from "@ng-nest/ui";
import { XUploadModule } from '@ng-nest/ui/upload';
import { XImageModule } from '@ng-nest/ui/image';
import { XStatisticModule } from '@ng-nest/ui/statistic';
import { XRadioModule } from '@ng-nest/ui/radio';
import { XPaginationModule } from '@ng-nest/ui/pagination';







import { ImageDetailComponent } from "./image-detail/image-detail.component";



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
    ImageRoutesModule,
    XPaginationModule
  ],
  declarations: [ImageComponent, ImageDetailComponent]
})
export class ImageModule { }
