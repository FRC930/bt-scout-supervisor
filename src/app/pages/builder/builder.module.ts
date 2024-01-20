import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuilderPageRoutingModule } from './builder-routing.module';

import { BuilderPage } from './builder.page';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonMetricComponent } from 'src/app/components/button-metric/button-metric.component';
import { DropdownMetricComponent } from '../../components/dropdown-metric/dropdown-metric.component';
import { ToggleMetricComponent } from 'src/app/components/toggle-metric/toggle-metric.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BuilderPageRoutingModule, DragDropModule],
  declarations: [BuilderPage, ButtonMetricComponent, DropdownMetricComponent, ToggleMetricComponent],
})
export class BuilderPageModule {}
