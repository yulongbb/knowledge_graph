import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VideoRoutesModule } from "./video-routes.module";
import { VideoComponent } from "./video.component";
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





import { VideoDetailComponent } from "./video-detail/video-detail.component";



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
    VideoRoutesModule
  ],
  declarations: [VideoComponent, VideoDetailComponent]
})
export class VideoModule { }
