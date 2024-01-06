import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExportPageRoutingModule } from './export-routing.module';
import { QRCodeModule } from 'angularx-qrcode';

import { ExportPage } from './export.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ExportPageRoutingModule, QRCodeModule],
  declarations: [ExportPage],
})
export class ExportPageModule {}
