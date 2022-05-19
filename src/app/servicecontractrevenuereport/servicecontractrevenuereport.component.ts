import { Component, OnInit } from '@angular/core';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-servicecontractrevenuereport',
  templateUrl: './servicecontractrevenuereport.component.html',
})
export class ServicecontractrevenuereportComponent implements OnInit {

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  data: any[] = [];
  showGrid = false;

  ngOnInit(): void {
    this.columnDefs = this.createColumnDefs();
  }


  GetData(data) {
    this.data = data
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
    // this.api.sizeColumnsToFit()
  }

  ExportData() {
    let eData = []

    this.data.forEach(x => {
      let obj = {}
      obj["Bill To"] = x.billto
      obj["Customer Site"] = x.custSiteName
      obj["Service Quote"] = x.servicequote
      obj["SQ Date"] = x.sqdate
      obj["Project"] = x.project
      obj["Start Date"] = x.sdate
      obj["End Date"] = x.edate
      eData.push(obj)
    })

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(eData);
    XLSX.utils.book_append_sheet(wb, ws1, "Sheet1");
    XLSX.writeFile(wb, "Service Contract Revenue Report.xlsx");

  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Bill To',
        field: 'billto',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'Bill To',
      },
      {
        headerName: 'Customer Site',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'Bill To',
      },
      {
        headerName: 'Service Quote',
        field: 'servicequote',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'SQ Date',
        field: 'sqdate',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Project',
        field: 'project',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Start Date',
        field: 'sdate',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'End Date',
        field: 'edate',
        filter: true,
        editable: false,
        sortable: true
      },

    ]
  }

}