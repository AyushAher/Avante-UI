import { Component, EventEmitter, Output } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { first } from 'rxjs/operators';
import { DistributorService, NotificationService } from '../_services';
import { AmcComponent } from './amc';

@Component({
  template: `
  <button class="btn btn-link" *ngIf="params.deleteaccess" type="button">
    <i class="fas fa-trash-alt" title="Delete"></i>
  </button>
  
  `})
export class AmcInstrumentRendererComponent implements AgRendererComponent {
  params: any;
  constructor() { }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}
