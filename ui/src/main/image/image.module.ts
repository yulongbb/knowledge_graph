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
import { XDescriptionModule } from '@ng-nest/ui/description';
import { XImageModule } from '@ng-nest/ui/image';
import { XStatisticModule } from '@ng-nest/ui/statistic';





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
    ImageRoutesModule
  ],
  declarations: [ImageComponent, ImageDetailComponent]
})
export class ImageModule { }
