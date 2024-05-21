import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KnowledgeRoutesModule } from "./knowledge-routes.module";
import { KnowledgeComponent } from "./knowledge.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { XPageHeaderModule } from '@ng-nest/ui/page-header';
import { XUploadModule } from '@ng-nest/ui/upload';


import { KnowledgeDetailComponent } from "./knowledge-detail/knowledge-detail.component";
import { XInputModule } from "@ng-nest/ui";



@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    XInputModule,
    XPageHeaderModule,
    XUploadModule,
    AuAdaptionModule,
    KnowledgeRoutesModule
  ],
  declarations: [KnowledgeComponent, KnowledgeDetailComponent]
})
export class KnowledgeModule { }
