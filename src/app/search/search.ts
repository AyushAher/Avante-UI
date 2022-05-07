import { Component, OnInit, ViewChild } from '@angular/core';

import { CustomerSite, Instrument, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import { AccountService, AlertService, CustomerSiteService, InstrumentService, NotificationService } from '../_services';
import { lnkRenderComponent } from './lnkrendercomponent';


@Component({
  selector: 'app-search',
  templateUrl: './search.html',
})
export class SearchComponent implements OnInit {

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  showGrid: any;
  instrumentList: any;

  constructor() { }

  ngOnInit() {
    this.columnDefs = this.createColumnDefs();
  }


  DataFilter(event) {
    this.instrumentList = event
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 50,
        cellRendererFramework: lnkRenderComponent,
        cellRendererParams: {
          inRouterLink: '/instrumentRonly',
        },
      },
      {
        headerName: 'serial No',
        field: 'serialnos',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'serialnos',
      },
      {
        headerName: 'Site Name',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custSiteName',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }
}

export class search {
  search: string;
  custSiteId: string;
}
