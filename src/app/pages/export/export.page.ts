import { Component, OnInit, ViewChild } from '@angular/core';
import { MatchDataService, MatchData } from 'src/app/shared/db/match-data/match-data.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-export',
  templateUrl: './export.page.html',
  styleUrls: ['./export.page.scss'],
})
export class ExportPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  events: string[] = [];

  csvData: string = '';

  constructor(private matchDataService: MatchDataService) {}

  async ngOnInit() {
    this.events = await this.matchDataService.getAllEvents();
  }

  async selectEvent(eventKey: string) {
    const matches = await this.matchDataService.getAllMatchesForEvent(eventKey);
    const csv = this.convertToCSV(matches);
    this.csvData = csv;
    this.modal.present();
  }

  async shareCSV() {
    const fileName = 'temp.csv';

    await Filesystem.writeFile({
      path: fileName,
      data: this.csvData,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    const fileUri = await Filesystem.getUri({
      directory: Directory.Documents,
      path: fileName,
    });

    await Share.share({
      url: fileUri.uri,
      title: 'Match CSV Data',
    });
  }

  convertToCSV(matches: MatchData[]): string {
    const replacer = (key: any, value: any) => (value === null ? '' : value);
    const header = Object.keys(matches[0]);
    const csv = [header.join(','), ...matches.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','))].join('\r\n');

    return csv;
  }
}
