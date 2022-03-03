import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { first } from 'rxjs/operators';
import { ResultMsg } from "../_models";
import { AmcinstrumentService } from "../_services/amcinstrument.service";
import { NotificationService } from "../_services";

@Component({
  template: `
    <button class="btn btn-link" (click)="delete(params.value)"  [disabled]="!params.deleteaccess" type="button">
      <i class="fas fa-trash-alt" title="Delete"></i>
    </button>

  `
})
export class AmcInstrumentRendererComponent implements AgRendererComponent {
  params: any;

  constructor(
    private AmcInstrumentService: AmcinstrumentService,
    private notificationService: NotificationService,
  ) {
  }

  agInit(params: any): void {
    this.params = params;
  }

  delete(id) {
    console.log(this.params.deleteaccess);
    
    if (this.params.deleteaccess) {
      this.AmcInstrumentService.delete(id)
        .pipe(first())
        .subscribe({
          next: (data: ResultMsg) => {
            this.notificationService.filter("itemadded");
          }
        });
    }
  }

  refresh(): boolean {
    return false;
  }
}
