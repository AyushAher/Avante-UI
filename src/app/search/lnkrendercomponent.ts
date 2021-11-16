import { Component, OnInit } from '@angular/core';

import { User, Distributor, Country } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';
import { AgRendererComponent } from 'ag-grid-angular';
import {
  AccountService, AlertService, DistributorService, CountryService, DistributorRegionService,
  ContactService, CustomerSiteService, InstrumentService, SparePartService, CustomerService
} from '../_services';

@Component({
  template: `<a [routerLink]="[params.inRouterLink,params.value]" style="margin-right: 10px;"><i class="fas fa-link" title="view"></i></a>
`
})
export class lnkRenderComponent implements AgRendererComponent  {
  params: any;
  constructor(private distributorService: DistributorService,
    private distributorRegionService: DistributorRegionService,
    private alertService: AlertService,
    private contactService: ContactService,
    private custsiteService: CustomerSiteService,
    private sparepartService: SparePartService,
    private instrumnetservice: InstrumentService,
    private customerservice: CustomerService,
  ) {

  }
  agInit(params: any): void {
    ////debugger;
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }
 
  delete(params: any) {
    //debugger;
    if (params.deleteLink == "D") {
      //debugger;
      this.distributorService.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.alertService.success('Record has been delete');
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
    else if (params.deleteLink == "DR") {
      this.distributorRegionService.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
            this.alertService.success('Record has been delete');
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
    else if (params.deleteLink == "C") {
      this.contactService.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
            this.alertService.success('Record has been delete');
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
    else if (params.deleteLink == "CU") {
      this.customerservice.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
            this.alertService.success('Record has been delete');
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
    else if (params.deleteLink == "CS") {
      this.custsiteService.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
            this.alertService.success('Record has been delete');
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
    else if (params.deleteLink == "I") {
      this.instrumnetservice.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
            this.alertService.success('Record has been delete');
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
    else if (params.deleteLink == "S") {
      this.sparepartService.delete(params.value)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            const selectedData = params.api.getSelectedRows();
            params.api.applyTransaction({ remove: selectedData });
            this.alertService.success('Record has been delete');
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
  }
}
