import { Injectable } from '@angular/core';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import { InitializeResult, Status } from '@awesome-cordova-plugins/bluetooth-le';
import { BehaviorSubject, Observable } from 'rxjs';
import { CHAR_MESSAGE_QUEUE_UUID, CHAR_SCOUTING_FORM_REQUEST_UUID } from '../bluetooth/gatt';
import { ConnectionMessage, DisconnectMessage, Message, PingMessage, MessageTopic, RequestFormsMessage, buildFormsDataMessage, MatchDataMessage } from './messaging.model';
import { UnreliableUnorderedUnchunker } from '../chunker/unchunker';
import { ScoutingFormService } from '../../db/scouting-form/scouting-form.service';
import { MatchDataPayload } from '../../models/message-payloads/match_data.payload';
import { MatchDataService } from '../../db/match-data/match-data.service';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _connectedDevices: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public readonly connectedDevices: Observable<string[]> = this._connectedDevices.asObservable();

  private _inboundMessageQueue: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public readonly inboundMessageQueue: Observable<string[]> = this._inboundMessageQueue.asObservable();
  private unchunker = new UnreliableUnorderedUnchunker();

  // private watchdogs = new Map<string, any>();

  constructor(private bt: BluetoothService, private formService: ScoutingFormService, private matchDataService: MatchDataService) {
    this.bt.deviceStatus.subscribe(this.bluetoothBroker.bind(this));
    this.unchunker.onMessage = (message) => {
      this.writeRequested(this.bt.ble.bytesToString(message));
    };
  }

  public isAdvertising(): Promise<boolean> {
    return this.bt.ble.isAdvertising().then((status: { status: boolean }) => status.status);
  }

  private bluetoothBroker(result: InitializeResult | null) {
    if (result === null) return;
    const { status } = result;
    switch (status) {
      case 'writeRequested':
        this.unchunker.add(this.bt.ble.encodedStringToBytes(result.value));
        break;
      case 'readRequested':
        this.readRequest(result);
        break;
    }
  }

  begin(): Promise<{ status: Status }> {
    return this.bt.startAdvertising();
  }

  stop(): Promise<{ status: Status }> {
    return this.bt.stopAdvertising();
  }

  notify(message: Message<MessageTopic, any>) {
    this.bt.notify(CHAR_MESSAGE_QUEUE_UUID, JSON.stringify(message));
  }

  private deviceConnect(message: ConnectionMessage) {
    const currentQueue = this._connectedDevices.getValue();
    this._connectedDevices.next([...currentQueue, message.id || '']);
    // let timeout = setTimeout(() => this.deviceDisconnect(message.id), 1000);
    // this.watchdogs.set(message.id, timeout);
  }

  private deviceDisconnect(messageId: string) {
    const devices = this._connectedDevices.getValue();
    if (devices.indexOf(messageId) > -1) {
      devices.splice(devices.indexOf(messageId), 1);
    }
    this._connectedDevices.next(devices);
  }

  private ping(queueMessage: PingMessage) {
    // const timeout = this.watchdogs.get(queueMessage.id);
    // clearTimeout(timeout);
    // this.watchdogs.set(
    //   queueMessage.id,
    //   setTimeout(() => this.deviceDisconnect(queueMessage.id), 1000)
    // );
  }

  private requestForms(message: RequestFormsMessage) {
    this.formService.getForms().then((forms) => {
      this.bt.notify(CHAR_MESSAGE_QUEUE_UUID, JSON.stringify(buildFormsDataMessage(message.id || '', forms)));
    });
  }

  private matchData(message: MatchDataMessage) {
    const payload = message.payload as MatchDataPayload;
    if (message.id && message.id.length > 0) {
      this.matchDataService.addOrUpdateMatch({
        deviceId: message.id,
        eventKey: payload.event,
        teamNumber: payload.team,
        matchNumber: payload.match,
        ...payload,
      });
    }
  }

  private writeRequested(message: string) {
    const queueMessage: Message<MessageTopic, any> = JSON.parse(message);
    console.log('MESSAGE RECEIVED', queueMessage);
    if (!queueMessage.topic) return;
    switch (queueMessage.topic) {
      case MessageTopic.CONNECT:
        console.log('CONNECT');
        this.deviceConnect(queueMessage as ConnectionMessage);
        break;
      case MessageTopic.PING:
        console.log('PING');
        this.ping(queueMessage as PingMessage);
        break;
      case MessageTopic.REQUEST_FORMS:
        console.log('REQUEST_FORMS');
        this.requestForms(queueMessage as RequestFormsMessage);
        break;
      case MessageTopic.MATCH_DATA:
        console.log('MATCH_DATA');
        this.matchData(queueMessage as MatchDataMessage);
        break;
    }
  }

  private async readRequest(result: InitializeResult) {
    const { address, characteristic, requestId } = result;
    switch (characteristic) {
      case CHAR_MESSAGE_QUEUE_UUID:
        const value = JSON.stringify({} /*this._outboundMessageQueue.getValue()*/);
        this.bt.respondToDevice(requestId, address, value);
        break;
      case CHAR_SCOUTING_FORM_REQUEST_UUID:
        const forms = await this.formService.getForms();
        this.bt.respondToDevice(requestId, address, JSON.stringify(forms));
        break;
      default:
        break;
    }
  }
}
