import { Injectable } from '@angular/core';
import { BluetoothLE, InitializeResult, Status } from '@awesome-cordova-plugins/bluetooth-le/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLUETOOTH_GATT, SERVICE_UUID } from './gatt';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  private _deviceStatus: BehaviorSubject<InitializeResult | null> = new BehaviorSubject<InitializeResult | null>(null);
  public readonly deviceStatus: Observable<InitializeResult | null> = this._deviceStatus.asObservable();

  private charSubscriptions: {[char: string]: string[]} = {};

  constructor(private ble: BluetoothLE, private platform: Platform) {
    this.ble.initialize().subscribe( () => {
      this.ble.initializePeripheral().subscribe(result => {
        const {status, address, characteristic} = result;

        switch(status) {
          case 'subscribed':
            this.subscribeDeviceToCharacteristic(characteristic, address);
            break;
          case 'unsubscribed':
            this.unsubscribeDeviceFromCharacteristic(characteristic, address);
            break;
          default: 
            this._deviceStatus.next({...result, value: atob(result.value)});
        }
      });
    });
  }
    
  async startAdvertising(): Promise<{status: Status}> {
    return this.ble.addService(BLUETOOTH_GATT)
      .then(() => this.ble.startAdvertising({
        services: [SERVICE_UUID],
        service: SERVICE_UUID,
        name: 'BT Scout Service' 
      }));
  }

  async stopAdvertising(): Promise<{status: Status}> {
    return this.ble.stopAdvertising().then( () => this.ble.removeAllServices());
  }

  subscribeDeviceToCharacteristic(characteristic: string, deviceAddress: string) {
    if (this.charSubscriptions[characteristic] && this.charSubscriptions[characteristic].indexOf(deviceAddress) === -1) {
      this.charSubscriptions[characteristic] = [deviceAddress, ...this.charSubscriptions[characteristic]];
    } else {
      this.charSubscriptions[characteristic] = [deviceAddress];
    }
  }

  unsubscribeDeviceFromCharacteristic(characteristic: string, deviceAddress: string) {
    if (this.charSubscriptions[characteristic] && this.charSubscriptions[characteristic].indexOf(deviceAddress) === -1) {
      this.charSubscriptions[characteristic].splice(this.charSubscriptions[characteristic].indexOf(deviceAddress), 1);
    }
  }

  respondToDevice(requestId: number, deviceAddress: string, response: string) {
    this.ble.respond({
      requestId: requestId,
      value: btoa(response),
      address: deviceAddress
    } as any);
  }

  async notify(characteristic: string, response: string) {
    if(this.platform.is('ios')) {
      const resp = await this.ble.notify({
        service: SERVICE_UUID,
        characteristic: characteristic,
        value: btoa(response)
      });

      if (!resp.sent) {
        while (this._deviceStatus.getValue()?.status !== 'notifyReady') {};
        await this.notify(characteristic, response);
      }
    } else {
      const devices = this.charSubscriptions[characteristic] || [];
      for(const device in devices) {
        await this.ble.notify({
          service: SERVICE_UUID,
          characteristic: characteristic,
          value: btoa(response),
          address: device
        });

        while (this._deviceStatus.getValue()?.status !== 'notificationSent') {};
      }
    }
  }
}
