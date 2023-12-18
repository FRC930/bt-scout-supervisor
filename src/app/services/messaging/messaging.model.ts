export interface Message<T, P> {
  topic: T;
  payload: P;
}

export type ConnectionMessage = Message<'CONNECT', { id: string }>;
export type PingMessage = Message<'PING', { id: string }>;
export type DisconnectMessage = Message<'DISCONNECT', { id: string }>;
export type DataMessage = Message<'DATA', { id: string; message: any }>;
export type ResponseMessage = Message<
  'RESPONSE',
  { id: string; deviceId: string; message: any }
>;
export type DequeueMessage = Message<'DEQUEUE', { messageId: string }>;

/*
    { topic: 'CONNECT', payload: { id: 'DEVICE-ID' } }
    { topic: 'DISCONNECT', payload: { id: 'DEVICE-ID' } }
    { topic: 'PING', payload: { id: 'DEVICE-ID' } }

    { topic: 'DATA', payload: { id: 'DEVICE-iD', message: 'blah blah blah' } }
    { topic: 'RESPONSE', payload: { id: 'MESSAGE-ID', deviceId: 'DEVICE-ID', message: 'blah blah blah' } } }
    { topic: 'DEQUEUE', payload: { messageId: 'MESSAGE-ID' } }

*/
