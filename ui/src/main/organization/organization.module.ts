import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationComponent } from './organization.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [OrganizationComponent],
  imports: [CommonModule, FormsModule,  RouterModule.forChild([
              {
                  path: '',
                  component: OrganizationComponent,
              },
          ]),],
  exports: [OrganizationComponent]
})
export class OrganizationModule {}
