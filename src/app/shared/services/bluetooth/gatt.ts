import { Characteristic } from '@awesome-cordova-plugins/bluetooth-le';

export const SERVICE_UUID = '9ac0d564-0930-44d9-a0c4-827bdb63ae40'.toUpperCase();
export const CHAR_MESSAGE_QUEUE_UUID = '9ac0d564-0930-4d3c-b0c8-9816cf5ce4ac'.toUpperCase();
export const CHAR_SCOUTING_FORM_REQUEST_UUID = '9ac0d564-0930-49b9-8ee8-75eace65c331'.toUpperCase();

export const CHAR_UNUSED3_UUID = '9ac0d564-0930-4b65-8cf5-ac3613baddf3'.toUpperCase();
export const CHAR_UNUSED4_UUID = '9ac0d564-0930-41b0-84ab-a57a2b124995'.toUpperCase();
export const CHAR_UNUSED5_UUID = '9ac0d564-0930-4fe9-8364-f8582bfecccd'.toUpperCase();
export const CHAR_UNUSED6_UUID = '9ac0d564-0930-492d-b15b-c1ddee47ca43'.toUpperCase();
export const CHAR_UNUSED7_UUID = '9ac0d564-0930-45c3-9599-b922965d36e0'.toUpperCase();
export const CHAR_UNUSED8_UUID = '9ac0d564-0930-461e-927d-40a54c15249f'.toUpperCase();
export const CHAR_UNUSED9_UUID = '9ac0d564-0930-4ed7-888f-17fff65b14d4'.toUpperCase();
export const CHAR_UNUSED0_UUID = '9ac0d564-0930-429c-be64-b0227db5204d'.toUpperCase();

export const BLUETOOTH_GATT: {
  service: string;
  characteristics: Characteristic[];
} = {
  service: SERVICE_UUID,
  characteristics: [
    {
      uuid: CHAR_MESSAGE_QUEUE_UUID,
      permissions: {
        write: true,
      },
      properties: {
        write: true,
        writeWithoutResponse: true,
        notify: true,
      },
    },
    {
      uuid: CHAR_SCOUTING_FORM_REQUEST_UUID,
      permissions: {
        read: true,
      },
      properties: {
        read: true,
      },
    },
  ],
};
