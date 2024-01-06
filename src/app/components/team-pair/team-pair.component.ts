import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ScoutingStation } from '../../pages/dashboard/station.model';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-team-pair',
  templateUrl: './team-pair.component.html',
  styleUrls: ['./team-pair.component.scss'],
})
export class TeamPairComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @Input() station: ScoutingStation = { station: 'Red', position: 1, devices: [], team: 0 };

  @Output() stationUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  drop(event: CdkDragDrop<{ name: string; address: string; connected: boolean }[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.stationUpdated.emit(true);
    }
  }

  openUpdateTeamModal() {
    this.modal.present();
  }

  closeModal() {
    this.modal.dismiss();
    this.stationUpdated.emit(true);
  }
}
