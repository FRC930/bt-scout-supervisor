import { Characteristic } from "@awesome-cordova-plugins/bluetooth-le"

export const SERVICE_UUID = '09306421-9ac0-44d9-a0c4-827bdb63ae40'
export const CHAR_MESSAGE_QUEUE_UUID = '09306421-d564-4d3c-b0c8-9816cf5ce4ac'
export const CHAR_UNUSED2_UUID = '09306421-4a09-49b9-8ee8-75eace65c331'
export const CHAR_UNUSED3_UUID = '09306421-4fac-4b65-8cf5-ac3613baddf3'
export const CHAR_UNUSED4_UUID = '09306421-e8f3-41b0-84ab-a57a2b124995'
export const CHAR_UNUSED5_UUID = '09306421-ab1c-4fe9-8364-f8582bfecccd'
export const CHAR_UNUSED6_UUID = '09306421-f82c-492d-b15b-c1ddee47ca43'
export const CHAR_UNUSED7_UUID = '09306421-4a40-45c3-9599-b922965d36e0'
export const CHAR_UNUSED8_UUID = '09306421-43bc-461e-927d-40a54c15249f'
export const CHAR_UNUSED9_UUID = '09306421-7d9d-4ed7-888f-17fff65b14d4'
export const CHAR_UNUSED0_UUID = '09306421-3f7f-429c-be64-b0227db5204d'

export const BLUETOOTH_GATT: {service: string, characteristics: Characteristic[]} = {
    service: SERVICE_UUID,
    characteristics: [
        {
            uuid: CHAR_MESSAGE_QUEUE_UUID,
            permissions: {
                read: true,
                write: true
            },
            properties: {
                read: true,
                write: true,
                writeWithoutResponse: true,
                notify: true
            }
        }
    ]
}