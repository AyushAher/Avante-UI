import { Component, OnInit } from '@angular/core';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { User } from '../_models';
import { AccountService, ServiceRequestService } from '../_services';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-servicereqestreport',
  templateUrl: './servicereqestreport.component.html',
})
export class ServicereqestreportComponent implements OnInit {
  user: User;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  data: any[] = [];
  showGrid = false;

  constructor(
    private serviceRequestService: ServiceRequestService,
    private accountService: AccountService,
  ) { }

  ngOnInit(): void {
    this.user = this.accountService.userValue;
    this.columnDefs = this.createDisColumnDefs();
  }

  ExportData() {

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
    XLSX.utils.book_append_sheet(wb, ws1, "Sheet1");
    XLSX.writeFile(wb, "Service Request Report.xlsx");

  }
  GetData(data) {
    this.data = data?.filter(x => !x.isReportGenerated)
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  private createDisColumnDefs() {
    return [
      {
        headerName: 'Date of Service Request',
        field: 'serreqdate',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Engineer Assigned',
        field: 'assignedtoName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      }, {
        headerName: 'Site Name',
        field: 'sitename',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Current Status',
        field: 'statusName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Reason for delay',
        field: 'assignedtoName',
        filter: true,
        editable: false,
        sortable: true
      }]
  }

}
