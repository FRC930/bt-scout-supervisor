import { DSAssignPayload } from '../../models/message-payloads/ds_assign.payload';
import { FormsDataPayload } from '../../models/message-payloads/forms_data.payload';
import { MatchDataPayload } from '../../models/message-payloads/match_data.payload';
import { RequestApprovalPayload } from '../../models/message-payloads/request_approval.payload';
import { RequestFormsPayload } from '../../models/message-payloads/request_forms.payload';
import { RequestResponsePayload } from '../../models/message-payloads/request_response.payload';

export interface Message<T extends MessageTopic, P> {
  topic: T;
  id?: string;
  payload?: P;
}

export enum MessageTopic {
  CONNECT = 'CONNECT',
  PING = 'PING',
  DISCONNECT = 'DISCONNECT',
  MATCH_INFO = 'MATCH_INFO',
  DS_ASSIGN = 'DS_ASSIGN',
  MATCH_DATA = 'MATCH_DATA',
  TEAM_DATA = 'TEAM_DATA',
  REQUEST_APPROVAL = 'REQUEST_APPROVAL',
  REQUEST_RESPONSE = 'REQUEST_RESPONSE',
  REQUEST_FORMS = 'REQUEST_FORMS',
  FORMS_DATA = 'FORMS_DATA',
  ALERT = 'ALERT',
  INFO = 'INFO',
  WARNING = 'WARNING',
  EMPTY = 'EMPTY',
}

export type ConnectionMessage = Message<MessageTopic.CONNECT, {}>;
export type PingMessage = Message<MessageTopic.PING, {}>;
export type DisconnectMessage = Message<MessageTopic.DISCONNECT, {}>;
export type DataMessage = Message<MessageTopic.MATCH_DATA, MatchDataPayload>;
export type DSAssignMessage = Message<MessageTopic.DS_ASSIGN, DSAssignPayload>;
export type RequestAprovalMessage = Message<MessageTopic.REQUEST_APPROVAL, RequestApprovalPayload>;
export type RequestResponseMessage = Message<MessageTopic.REQUEST_RESPONSE, RequestResponsePayload>;
export type RequestFormsMessage = Message<MessageTopic.REQUEST_FORMS, RequestFormsPayload>;
export type MatchDataMessage = Message<MessageTopic.MATCH_DATA, MatchDataPayload>;
export type FormsDataMessage = Message<MessageTopic.FORMS_DATA, FormsDataPayload>;

export const buildDSAssignMessage = (message: DSAssignPayload): DSAssignMessage => ({
  topic: MessageTopic.DS_ASSIGN,
  payload: message,
});

export const buildFormsDataMessage = (id: string, message: FormsDataPayload): FormsDataMessage => ({
  topic: MessageTopic.FORMS_DATA,
  id: id,
  payload: message,
});

/*
    { topic: 'CONNECT', payload: { id: 'DEVICE-ID' } }
    { topic: 'DISCONNECT', payload: { id: 'DEVICE-ID' } }
    { topic: 'PING', payload: { id: 'DEVICE-ID' } }

    { topic: 'DATA', payload: { id: 'DEVICE-iD', message: 'blah blah blah' } }
    { topic: 'RESPONSE', payload: { id: 'MESSAGE-ID', deviceId: 'DEVICE-ID', message: 'blah blah blah' } } }
    { topic: 'DEQUEUE', payload: { messageId: 'MESSAGE-ID' } }

*/
