import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  NbThemeModule, 
  NbLayoutModule, 
  NbSidebarModule, 
  NbMenuModule, 
  NbUserModule,
  NbContextMenuModule,
  NbActionsModule,
  NbSearchModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbCardModule,
  NbToggleModule,
  NbDialogModule // Add this import for nb-dialog
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { IonicModule } from '@ionic/angular';
import { LayoutComponent } from './layout/layout.component';

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbUserModule,
    NbContextMenuModule,
    NbActionsModule,
    NbSearchModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbCardModule,
    NbToggleModule,
    NbDialogModule.forRoot(), // Add this module to imports
    NbEvaIconsModule,
    IonicModule.forRoot(), // Add IonicModule
    RouterModule.forChild([
      { path: '', component: LayoutComponent }
    ])  
  ],
  exports: [
    NbThemeModule,
    NbLayoutModule,
    NbSidebarModule,
    NbMenuModule,
    NbUserModule,
    NbContextMenuModule,
    NbActionsModule,
    NbSearchModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbCardModule,
    NbToggleModule,
    NbDialogModule, // Add this module to exports
    NbEvaIconsModule,
    IonicModule, // Export IonicModule
    LayoutComponent
  ],
})
export class NebularModule { }
