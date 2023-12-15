import { Injectable } from '@angular/core';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import { InitializeResult } from '@awesome-cordova-plugins/bluetooth-le';
import { BehaviorSubject, Observable } from 'rxjs';
import { CHAR_MESSAGE_QUEUE_UUID } from '../bluetooth/gatt';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  private _connectedDevices: BehaviorSubject<{[key: string]: any}> = new BehaviorSubject({});
  public readonly connectedDevices: Observable<{[key: string]: any}> = this._connectedDevices.asObservable();

  private _inboundMessageQueue: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public readonly inboundMessageQueue: Observable<string[]> = this._inboundMessageQueue.asObservable();

  private _outboundMessageQueue: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public readonly outboundMessageQueue: Observable<string[]> = this._outboundMessageQueue.asObservable();

  constructor(private bt: BluetoothService) { 
    this.bt.deviceStatus.subscribe(this.bluetoothBroker)
    this.outboundMessageQueue.subscribe( queue => {
      this.bt.notify(CHAR_MESSAGE_QUEUE_UUID, JSON.stringify(queue));
    })
  }

  private bluetoothBroker(result: InitializeResult | null) {
    if (result === null) return;
    const { status } = result
    switch(status) {
      case 'connected':
        this.deviceConnect(result);
        break;
      case 'disconnected':
        this.deviceDisconnect(result);
        break;
      case 'writeRequested':
        this.writeRequested(result);
        break;
      case 'readRequested':
        this.readRequest(result);
        break;
    }
  }

  begin() {
    this.bt.startAdvertising()
  }

  pushMessageToOutboundQueue(message: string) {
    const currentQueue = this._outboundMessageQueue.getValue();
    if(currentQueue.length >= 10) currentQueue.shift(); 

    this._outboundMessageQueue.next([...currentQueue, message]);
  }

  private deviceConnect(result: InitializeResult) {
    const devices = this._connectedDevices.getValue();
    devices[result.address] = true;
    this._connectedDevices.next(devices);
  }

  private deviceDisconnect(result: InitializeResult) {
    const devices = this._connectedDevices.getValue();
    devices[result.address] = false;
    this._connectedDevices.next(devices);
  }

  private writeRequested(result: InitializeResult) {
    const {characteristic, value} = result;
    if (characteristic === CHAR_MESSAGE_QUEUE_UUID) {
      this._inboundMessageQueue.next([...this._inboundMessageQueue.getValue(), value]);
    }
  }

  private readRequest(result: InitializeResult) {
    const {address, characteristic, requestId} = result;
    if (characteristic === CHAR_MESSAGE_QUEUE_UUID) {
      const value = JSON.stringify(this._outboundMessageQueue.getValue());
      this.bt.respondToDevice(requestId, address, value);
    }
  }

}
