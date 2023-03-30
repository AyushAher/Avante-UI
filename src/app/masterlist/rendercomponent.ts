import { Component } from '@angular/core';
import { first } from 'rxjs/operators';
import { AgRendererComponent } from 'ag-grid-angular';
import {
  ConfigTypeValueService,
  DistributorService,
  ListTypeService,
  NotificationService
} from '../_services';
import { PrevchklocpartelementService } from '../_services/prevchklocpartelement.service';

@Component({
  template: `
    <button *ngIf="!isMaster" class="btn btn-link" data-action-type="remove" (click)="delete(params)"><i class="fas fa-trash-alt" title="Delete"></i></button>
    <button class="btn btn-link" *ngIf="params.addAccess" [disabled]="!params.addAccess" data-action-type="add"><i class="fas fa-plus-circle" title="Add Value"
                                                                                         data-action-type="add"></i></button>
    <button *ngIf="!isMaster" class="btn btn-link" [disabled]="!params.hasUpdateAccess" data-action-type="edit"><i class="fas fas fa-pen" title="Edit Value"
                                                                                                data-action-type="edit"></i></button>
`
})
export class MRenderComponent implements AgRendererComponent {
  params: any;
  isMaster: boolean = false;

  constructor(private distributorService: DistributorService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private configService: ConfigTypeValueService,
    private prevchklocpartelementService: PrevchklocpartelementService,
  ) {

  }
  agInit(params: any): void {
    //debugger;
    this.params = params;
    this.isMaster = params.data.isMaster

  }

  refresh(params: any): boolean {
    return false;
  }


  delete(params: any) {
    //debugger;
    if (confirm("Are you sure, you want to delete the record?") == true) {
      if (params.deleteLink == "D") {
        //debugger;
        this.distributorService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              //debugger;
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              }
              else {

              }
            },
            error: () => {
              // this.alertService.error(error);

            }
          });
      }
      else if (params.deleteLink == "LITYIT") {
        //debugger;
        this.listTypeService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {

              }
            },
            error: () => {
              // this.alertService.error(error);

            }
          });
      }
      else if (params.deleteLink == "ELEMENT") {
        //debugger;
        this.prevchklocpartelementService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {

              }
            },
            error: () => {
              // this.alertService.error(error);

            }
          });
      } else if (params.deleteLink == "CNG") {
        //debugger;
        this.configService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {

              }
            },
            error: () => {
              // this.alertService.error(error);

            }
          });
      }
    }
  }
}
