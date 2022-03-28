import { Component, Output } from '@angular/core';

@Component({
  selector: 'layout',
  templateUrl: './layout.html',
})
export class LayoutComponent {
  shownotifications: boolean = false;
 
  Notifications(event) {
    this.shownotifications = event;
  }
}
