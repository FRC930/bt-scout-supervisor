import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MessagingService } from '../../shared/services/messaging/messaging.service';
import { ScoutingStationMap, initialScoutingStationMap } from './station.model';
import { DriverStationsService } from '../../shared/services/driver-stations/driver-stations.service';
import { buildDSAssignMessage } from 'src/app/shared/services/messaging/messaging.model';
import { MatchDataService } from 'src/app/shared/db/match-data/match-data.service';
import { IonModal, MenuController } from '@ionic/angular';
import { DSAssignPayload, Station } from 'src/app/shared/models/message-payloads/ds_assign.payload';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  public events: string[] = [];
  public deviceMap: ScoutingStationMap = initialScoutingStationMap;
  public isAdvertising: boolean = false;

  public newEventName: string = '';

  constructor(private msg: MessagingService, private ds: DriverStationsService, private ngZone: NgZone, private matchDataService: MatchDataService, private menuController: MenuController) {
    this.ds.scoutingStationMap.subscribe((map) => {
      console.log('new map', JSON.stringify(map));
      this.ngZone.run(() => {
        this.deviceMap = map;
      });
    });

    this.matchDataService.getAllEvents().then((events) => {
      this.ngZone.run(() => {
        this.events = events;
      });
    });
  }

  ngOnInit() {}

  broadcastMap() {
    let dsAssignMessage: DSAssignPayload = {
      event: this.deviceMap.event,
      match: this.deviceMap.match,
      matchType: this.deviceMap.matchType,
    };
    [this.deviceMap.red1, this.deviceMap.red2, this.deviceMap.red3, this.deviceMap.blue1, this.deviceMap.blue2, this.deviceMap.blue3].forEach((station) => {
      station.devices.forEach((device: { name: string; address: string; connected: boolean }) => {
        dsAssignMessage = {
          ...dsAssignMessage,
          [device.address]: {
            station: station.station,
            position: station.position,
            team: station.team.toString(),
          } as Station,
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

  openAddEventModal() {
    this.newEventName = '';
    this.modal.present();
  }

  addEvent() {
    this.events.push(this.newEventName);
    this.matchDataService.addEventIfNotExists(this.newEventName);
    this.modal.dismiss();
  }

  selectEvent(event: string) {
    this.deviceMap.event = event;
    this.menuController.close();
    this.broadcastMap();
  }
}
