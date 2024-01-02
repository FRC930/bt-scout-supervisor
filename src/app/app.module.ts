import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage/ngx';
import { TabsComponent } from './tabs.component';

@NgModule({
  declarations: [AppComponent, TabsComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, DragDropModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, BluetoothLE, KeyValueStorage],
  bootstrap: [AppComponent],
})
export class AppModule {}
