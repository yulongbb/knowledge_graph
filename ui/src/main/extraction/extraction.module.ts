import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExtractionRoutesModule } from "./extraction-routes.module";
import { ExtractionComponent } from "./extraction.component";
import { ShareModule } from "src/share/share.module";
import { AuToolModule } from "src/share/tool/tool.module";
import { AuAdaptionModule } from "src/share/adaption/adaption.module";
import { NgNestModule } from "src/share/ng-nest.module";
import { FormsModule } from "@angular/forms";

// NgNest UI components
import { XTreeModule } from '@ng-nest/ui/tree';
import { XTextareaModule } from '@ng-nest/ui/textarea';
import { XCheckboxModule, XDialogModule, XInputModule, XProgressModule, XTransferModule, XTableModule } from "@ng-nest/ui";
import { XStepsModule } from '@ng-nest/ui/steps';
import { XTabsModule } from '@ng-nest/ui/tabs';
import { XSelectModule } from '@ng-nest/ui/select';
import { XButtonModule } from '@ng-nest/ui/button';

// Services
import { ExtractionService } from './extraction.service';
import { EntityService } from '../entity/entity.service';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';
import { EsService } from '../start/search/es.service';
import { DatasetService } from '../dataset/dataset.sevice';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
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
    XDialogModule,
    XCheckboxModule,
    XProgressModule,
    XTableModule,
    XSelectModule,
    XButtonModule,
    ExtractionRoutesModule
  ],
  declarations: [ExtractionComponent],
  providers: [
    ExtractionService,
    EntityService,
    OntologyService,
    PropertyService,
    EsService,
    DatasetService
  ]
})
export class ExtractionModule {}
