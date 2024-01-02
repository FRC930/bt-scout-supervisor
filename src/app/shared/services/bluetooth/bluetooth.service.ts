import { Injectable } from '@angular/core';
import { BluetoothLE, InitializeResult, NotifyParams, RespondParams, Status } from '@awesome-cordova-plugins/bluetooth-le/ngx';
import { BehaviorSubject, Observable, Subject, from } from 'rxjs';
import { BLUETOOTH_GATT, SERVICE_UUID } from './gatt';
import { Platform } from '@ionic/angular';
import { UnreliableUnorderedChunker } from '../chunker/main';
import { concatMap, delay } from 'rxjs/operators';
import { KeyValue } from '@angular/common';

type NotifyOrRespondParams = KeyValue<'Notify', NotifyParams> | KeyValue<'Respond', RespondParams>;

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  private notificationReady = true;

  private notifyQueue: Subject<NotifyOrRespondParams> = new Subject<NotifyOrRespondParams>();

  private _deviceStatus: BehaviorSubject<InitializeResult | null> = new BehaviorSubject<InitializeResult | null>(null);
  public readonly deviceStatus: Observable<InitializeResult | null> = this._deviceStatus.asObservable();

  private charSubscriptions: { [char: string]: string[] } = {};

  constructor(public ble: BluetoothLE, private platform: Platform) {
    this.ble.initialize().subscribe((s) => {
      this.ble
        .initializePeripheral({
          request: true,
          restoreKey: 'bluetoothleplugin',
        })
        .subscribe((result) => {
          const { status, address, characteristic, value } = result;
          if ((status as any) === 'notificationReady') this.notificationReady = true;

          switch (status) {
            case 'subscribed':
              this.subscribeDeviceToCharacteristic(characteristic, address);
              break;
            case 'unsubscribed':
              this.unsubscribeDeviceFromCharacteristic(characteristic, address);
              break;
            case 'connected':
              this.ble.mtu({ mtu: 512, address: address });
              break;
            default:
              this._deviceStatus.next({
                ...result,
                value: value || '[]',
              });
          }
        });
    });

    this.notifyQueue.pipe(concatMap((params: NotifyOrRespondParams) => from(this.respondOrNotify(params)).pipe(delay(10)))).subscribe((_) => {});
  }

  async startAdvertising(): Promise<{ status: Status }> {
    return this.ble.addService(BLUETOOTH_GATT).then(() =>
      this.ble.startAdvertising({
        services: [SERVICE_UUID],
        service: SERVICE_UUID,
        name: 'BT Scout Service',
      })
    );
  }

  async stopAdvertising(): Promise<{ status: Status }> {
    return this.ble.stopAdvertising().then(() => this.ble.removeAllServices());
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

  async respondToDevice(requestId: number, deviceAddress: string, response: string) {
    for (const chunk of this.getNewChunker(response)) {
      this.notifyQueue.next({
        key: 'Respond',
        value: {
          requestId: requestId,
          address: deviceAddress,
          value: chunk,
        } as any,
      });
    }
  }

  notify(characteristic: string, response: string, chunkId?: number) {
    if (this.platform.is('ios')) {
      const chunker = this.getNewChunker(response);
      for (const chunk of chunker) {
        this.notifyQueue.next({
          key: 'Notify',
          value: {
            service: SERVICE_UUID,
            characteristic: characteristic,
            value: this.ble.bytesToEncodedString(chunk),
          },
        });
      }
    } else {
      const devices = this.charSubscriptions[characteristic] || [];
      for (const device in devices) {
        const chunker = this.getNewChunker(response);
        for (const chunk of chunker) {
          this.notifyQueue.next({
            key: 'Notify',
            value: {
              service: SERVICE_UUID,
              characteristic: characteristic,
              value: this.ble.bytesToEncodedString(chunk),
              address: device,
            },
          });
        }
      }
    }
  }

  private async respondOrNotify(kvp: NotifyOrRespondParams): Promise<{ status: Status; sent?: boolean }> {
    if (kvp.key === 'Notify') {
      return this.notifyLogic(kvp.value);
    } else {
      return this.respondLogic(kvp.value);
    }
  }

  private async respondLogic(params: RespondParams): Promise<{ status: Status; sent?: boolean }> {
    return this.ble.respond(params);
  }

  private async notifyLogic(params: NotifyParams): Promise<{ status: Status; sent?: boolean }> {
    if (this.platform.is('ios')) {
      let resp = await this.ble.notify(params);
      while (!resp.sent) {
        let expired = false;

        const timeout = setTimeout(() => {
          this.notifyQueue.next({ value: params, key: 'Notify' });
          expired = true;
        }, 1000);

        while (!this.notificationReady && (this._deviceStatus.getValue()?.status as any) !== 'notificationReady') {
          await new Promise((resolve) => setTimeout(resolve, 5));
          if (expired) return resp;
        }

        clearTimeout(timeout);
        this.notifyQueue.next({ value: params, key: 'Notify' });
      }
      return resp;
    } else {
      let resp = await this.ble.notify(params);
      while (this._deviceStatus.getValue()?.status !== 'notificationSent') {}
      return resp;
    }
  }

  private getNewMessageId(): number {
    let messageId = Math.floor(Math.random() * 10000);
    return messageId;
  }

  private getNewChunker(data: string): UnreliableUnorderedChunker {
    const messageId = this.getNewMessageId();
    const message = this.ble.stringToBytes(data);
    const chunkLength = 250; // Chunk byte length *including* 9 byte header
    return new UnreliableUnorderedChunker(messageId, message, chunkLength);
  }
}
