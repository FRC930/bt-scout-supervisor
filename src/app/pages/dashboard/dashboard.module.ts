import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { TeamPairComponent } from '../../components/team-pair/team-pair.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DashboardPageRoutingModule, DragDropModule],
  declarations: [DashboardPage, TeamPairComponent],
})
export class DashboardPageModule {}
