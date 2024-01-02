import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessagingService } from '../messaging/messaging.service';
import { buildDSAssignMessage } from '../messaging/messaging.model';
import { ScoutingStationMap, initialScoutingStationMap, ScoutingStation } from 'src/app/pages/dashboard/station.model';

@Injectable({
  providedIn: 'root',
})
export class DriverStationsService {
  private devices: Map<string, boolean> = new Map<string, boolean>();

  private _scoutingStationMap: BehaviorSubject<ScoutingStationMap> = new BehaviorSubject<ScoutingStationMap>(initialScoutingStationMap);
  public readonly scoutingStationMap: Observable<ScoutingStationMap> = this._scoutingStationMap.asObservable();

  constructor(private msg: MessagingService) {
    this.msg.connectedDevices.subscribe((newDevices) => {
      console.log('new devices', newDevices);
      let deviceCopy = new Map<string, boolean>();
      this.devices.forEach((_, key) => {
        deviceCopy.set(key, false);
      });

      newDevices.forEach((device) => {
        deviceCopy.set(device, true);
      });

      this.updateScoutingStationMap(deviceCopy);
    });
  }

  updateScoutingStationMap(devices: Map<string, boolean>) {
    if (devices.size === 0) return;
    const deviceMap = this._scoutingStationMap.getValue();
    const deviceConnectionMap = new Map<string, boolean>(devices);
    const stations: ScoutingStation[] = Object.values(deviceMap);

    deviceConnectionMap.forEach((connected, device) => {
      let found = false;
      stations.forEach((station) => {
        if (station.devices.some((d) => d.address === device)) {
          station.devices.forEach((d) => {
            if (d.address === device) {
              d.connected = connected;
            }
          });
          found = true;
        }
      });

      if (!found) {
        let minDevices = Number.MAX_SAFE_INTEGER;
        let targetStation: ScoutingStation | undefined;

        stations.forEach((station) => {
          if (station.devices.length < minDevices) {
            minDevices = station.devices.length;
            targetStation = station;
          }
        });

        if (targetStation) {
          targetStation.devices.push({
            name: device,
            address: device,
            connected: connected,
          });
        }
      }
    });

    this._scoutingStationMap.next({
      red1: stations[0],
      red2: stations[1],
      red3: stations[2],
      blue1: stations[3],
      blue2: stations[4],
      blue3: stations[5],
    });

    let dsAssignMessage = {};
    Object.values(this._scoutingStationMap.getValue()).forEach((station) => {
      station.devices.forEach((device: { name: string; address: string; connected: boolean }) => {
        dsAssignMessage = {
          ...dsAssignMessage,
          [device.address]: {
            station: station.station,
            position: station.position,
          },
        };
      });
    });

    this.msg.notify(buildDSAssignMessage(dsAssignMessage));
  }
}
