import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KnowledgeRoutesModule } from "./knowledge-routes.module";
import { KnowledgeComponent } from "./knowledge.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { KnowledgeDetailComponent } from "./knowledge-detail/knowledge-detail.component";
import { KnowledgeNodeComponent } from "./knowledge-node/knowledge-node.component";
import { XInputModule } from "@ng-nest/ui";
import { KnowledgeNodeDetailComponent } from "./knowledge-node/knowledge-node-detail/knowledge-node-detail.component";



@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    XInputModule,
    AuAdaptionModule,
    KnowledgeRoutesModule
  ],
  declarations: [KnowledgeComponent, KnowledgeDetailComponent, KnowledgeNodeComponent, KnowledgeNodeDetailComponent]
})
export class KnowledgeModule { }
