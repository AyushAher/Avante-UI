import { Component, OnInit } from '@angular/core';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import * as XLSX from "xlsx";


@Component({
  selector: 'app-servicecompletionreport',
  templateUrl: './servicecompletionreport.component.html',
})

export class ServicecompletionreportComponent implements OnInit {
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  data: any[] = [];
  showGrid = false;

  ngOnInit(): void {
    this.columnDefs = this.createDisColumnDefs();
  }

  ExportData() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
    XLSX.utils.book_append_sheet(wb, ws1, "Sheet1");
    XLSX.writeFile(wb, "Service Completion Report.xlsx");

  }

  GetData(data) {
    this.data = data?.filter(x => x.isCompleted)
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
    this.api.sizeColumnsToFit()
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
        field: 'engAssigned',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'No. Of Days Spent',
        field: 'totalDays',
        filter: true,
        editable: false,
        sortable: true
      }
    ]
  }
}