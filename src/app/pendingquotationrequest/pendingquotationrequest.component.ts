import { Component, OnInit } from '@angular/core';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-pendingquotationrequest',
  templateUrl: './pendingquotationrequest.component.html',
})
export class PendingquotationrequestComponent implements OnInit {
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
    XLSX.writeFile(wb, "Pending Quotation Request Report.xlsx");

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
        headerName: 'Date of quote ',
        field: 'podate',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Date of Completion',
        field: 'completedDate',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Reason for Delay',
        field: 'completedComments',
        filter: true,
        editable: false,
        sortable: true
      }
    ]
  }
}