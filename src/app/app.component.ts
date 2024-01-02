import { Component, NgZone, OnInit } from '@angular/core';
import { MessagingService } from './shared/services/messaging/messaging.service';
import { BluetoothService } from './shared/services/bluetooth/bluetooth.service';
import { Platform } from '@ionic/angular';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(public messagingService: MessagingService, public bt: BluetoothService, private ngZone: NgZone, private storage: KeyValueStorage) {}

  async ngOnInit() {
    await this.storage.create('totally_secure_encryption_key');
  }
}
