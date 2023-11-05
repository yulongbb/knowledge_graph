import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KnowledgeRoutesModule } from "./knowledge-routes.module";
import { KnowledgeComponent } from "./knowledge.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { KnowledgeDetailComponent } from "./knowledge-detail/knowledge-detail.component";


@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    KnowledgeRoutesModule
  ],
  declarations: [KnowledgeComponent, KnowledgeDetailComponent]
})
export class KnowledgeModule {}
