import { Component } from '@angular/core';
import { MessagingService } from './services/messaging/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public messagingService: MessagingService) {
    this.messagingService.begin();
  }
}
