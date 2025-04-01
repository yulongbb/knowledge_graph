import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CharacterListComponent } from './components/character-list/character-list.component';
import { UploadDialogComponent } from './components/upload-dialog/upload-dialog.component';
import { CharacterModelService } from './services/character-model.service';
import { ModelViewerComponent } from './components/model-viewer/model-viewer.component';
import { RouterModule } from '@angular/router';
import { FileSizePipe } from './pipes/file-size.pipe';

@NgModule({
    declarations: [
        CharacterListComponent,
        UploadDialogComponent,
        ModelViewerComponent,
        FileSizePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forChild([
            {
                path: '',
                component: CharacterListComponent,
            },

        ]),
    ],
    providers: [
        CharacterModelService
    ],
    exports: [
        CharacterListComponent
    ]
})
export class ThreeDModelModule { }
