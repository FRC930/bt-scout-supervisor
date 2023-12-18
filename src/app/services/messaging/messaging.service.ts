import { Injectable } from '@angular/core';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import { InitializeResult } from '@awesome-cordova-plugins/bluetooth-le';
import { BehaviorSubject, Observable } from 'rxjs';
import { CHAR_MESSAGE_QUEUE_UUID } from '../bluetooth/gatt';
import {
  ConnectionMessage,
  DisconnectMessage,
  Message,
  DataMessage,
  ResponseMessage,
} from './messaging.model';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _connectedDevices: BehaviorSubject<string[]> = new BehaviorSubject<
    string[]
  >([]);
  public readonly connectedDevices: Observable<string[]> =
    this._connectedDevices.asObservable();

  private _inboundMessageQueue: BehaviorSubject<string[]> = new BehaviorSubject<
    string[]
  >([]);
  public readonly inboundMessageQueue: Observable<string[]> =
    this._inboundMessageQueue.asObservable();

  private _outboundMessageQueue: BehaviorSubject<Message<string, any>[]> =
    new BehaviorSubject<Message<string, any>[]>([]);
  public readonly outboundMessageQueue: Observable<Message<string, any>[]> =
    this._outboundMessageQueue.asObservable();

  constructor(private bt: BluetoothService) {
    this.bt.deviceStatus.subscribe(this.bluetoothBroker.bind(this));
  }

  private bluetoothBroker(result: InitializeResult | null) {
    if (result === null) return;
    const { status } = result;
    switch (status) {
      case 'writeRequested':
        this.writeRequested(result);
        break;
      case 'readRequested':
        this.readRequest(result);
        break;
    }
  }

  begin() {
    this.bt.startAdvertising().then(() => {
      this.outboundMessageQueue.subscribe((queue) => {
        this.bt.notify(CHAR_MESSAGE_QUEUE_UUID, JSON.stringify(queue));
      });
    });
  }

  pushMessageToOutboundQueue(message: DataMessage) {
    const currentQueue = this._outboundMessageQueue.getValue();
    if (currentQueue.length >= 10) currentQueue.shift();

    const newMessage: ResponseMessage = {
      topic: 'RESPONSE',
      payload: {
        id: '1',
        deviceId: message.payload.id,
        message: message.payload.message,
      },
    };

    this._outboundMessageQueue.next([...currentQueue, newMessage]);
  }

  private deviceConnect(message: ConnectionMessage) {
    const currentQueue = this._connectedDevices.getValue();
    this._connectedDevices.next([...currentQueue, message.payload.id]);
    console.log('CONNECTED DEVICES', this._connectedDevices.getValue());
  }

  private deviceDisconnect(message: DisconnectMessage) {
    const devices = this._connectedDevices.getValue();
    if (devices.indexOf(message.payload.id) > -1) {
      devices.splice(devices.indexOf(message.payload.id), 1);
    }
    this._connectedDevices.next(devices);
  }

  private writeRequested(result: InitializeResult) {
    const { characteristic, value } = result;
    if (characteristic === CHAR_MESSAGE_QUEUE_UUID) {
      const queueMessage = JSON.parse(value);
      console.log('MESSAGE RECEIVED', queueMessage);
      if (!queueMessage.topic) return;
      switch (queueMessage.topic) {
        case 'CONNECT':
          this.deviceConnect(queueMessage as ConnectionMessage);
          break;
        case 'DISCONNECT':
          this.deviceDisconnect(queueMessage as DisconnectMessage);
          break;
        case 'PING':
          break;
        case 'QUEUE':
          this.pushMessageToOutboundQueue(queueMessage as DataMessage);
          break;
        case 'RESPONSE':
          break;
        case 'DEQUEUE':
          break;
      }
      // this._inboundMessageQueue.next([
      //   ...this._inboundMessageQueue.getValue(),
      //   value,
      // ]);
    }
  }

  private readRequest(result: InitializeResult) {
    const { address, characteristic, requestId } = result;
    console.log('read request', characteristic);
    if (characteristic === CHAR_MESSAGE_QUEUE_UUID) {
      const value = JSON.stringify(this._outboundMessageQueue.getValue());
      console.log('read request', value);
      this.bt.respondToDevice(requestId, address, value);
    }
  }
}
