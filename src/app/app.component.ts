import { Component, NgZone, OnInit } from '@angular/core';
import { MessagingService } from './services/messaging/messaging.service';
import { BluetoothService } from './services/bluetooth/bluetooth.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public status = '';
  public devices: string[] = [];

  constructor(
    public messagingService: MessagingService,
    public bt: BluetoothService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  public connect() {
    this.messagingService.begin();
    this.bt.deviceStatus.subscribe((status) => {
      this.ngZone.run(() => {
        this.status = JSON.stringify(status);
      });
    });

    this.messagingService.connectedDevices.subscribe((devices) => {
      this.ngZone.run(() => {
        this.devices = devices;
      });
    });
  }
}
