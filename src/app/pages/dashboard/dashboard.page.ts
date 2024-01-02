import { Component, NgZone, OnInit } from '@angular/core';
import { TeamPairComponent } from '../../components/team-pair/team-pair.component';
import { MessagingService } from '../../shared/services/messaging/messaging.service';
import { ScoutingStation, ScoutingStationMap, initialScoutingStationMap } from './station.model';
import { DriverStationsService } from '../../shared/services/driver-stations/driver-stations.service';
import { buildDSAssignMessage } from 'src/app/shared/services/messaging/messaging.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  public deviceMap: ScoutingStationMap = initialScoutingStationMap;
  public isAdvertising: boolean = false;

  constructor(private msg: MessagingService, private ds: DriverStationsService, private ngZone: NgZone) {
    this.ds.scoutingStationMap.subscribe((map) => {
      this.ngZone.run(() => {
        this.deviceMap = map;
      });
    });
  }

  ngOnInit() {}

  broadcastMap() {
    let dsAssignMessage = {};
    Object.values(this.deviceMap).forEach((station) => {
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

  connect() {
    this.msg.begin().then(() => {
      this.ngZone.run(() => {
        this.isAdvertising = true;
      });
    });
  }

  disconnect() {
    this.msg.stop().then(() => {
      this.ngZone.run(() => {
        this.isAdvertising = false;
      });
    });
  }
}
