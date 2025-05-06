import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExtractionRoutesModule } from "./extraction-routes.module";
import { ExtractionComponent } from "./extraction.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    ExtractionRoutesModule,
    CodemirrorModule
  ],
  declarations: [ExtractionComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExtractionModule {}
