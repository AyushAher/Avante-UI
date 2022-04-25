import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import * as XLSX from 'xlsx'
import { NotificationService } from '../_services';
import { ImportdataService } from '../_services/importdata.service';


@Component({
  selector: 'app-importdata',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})

export class ImportDataComponent implements OnInit {
  file: any;
  arrayBuffer: any;
  fileData: any
  form: any
  datepipe = new DatePipe('en-US');
  @ViewChild('files') files: any

  constructor(
    private formBuilder: FormBuilder,
    private service: ImportdataService,
    private modalService: BsModalService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      items: this.formBuilder.array([]),
      purposeOfVisit: "",
      employeeName: "",
      serviceRequestNo: "",
      customerName: "",
      startDate: "",
      endDate: "",
      totalDays: "",
      designation: "",
      grandTotal: 0
    })
  }

  readData() {
    this.file = this.files.nativeElement.files[0];
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.file);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      workbook.SheetNames.forEach(sheet => {
        var worksheet = workbook.Sheets[sheet];
        if (sheet == "Expense") this.submitData(XLSX.utils.sheet_to_json(worksheet, { raw: true }), sheet)
      });

    }
  }

  submitData(data: any, sheet) {

    data.forEach((element, index) => {
      var item = this.formBuilder.group({
        currency: "",
        remarks: "",
        expDate: [""],
        expNature: [""],
        expDetails: [""],
        isBillsAttached: false,
        bcyAmt: [""],
        usdAmt: [""],
      })

      if (index == 0) {
        this.form.get('purposeOfVisit').setValue(element.Purpose_of_Visit)
        this.form.get('employeeName').setValue(element.Employee_Name)
        this.form.get('serviceRequestNo').setValue(element.Service_Request_No)
        this.form.get('customerName').setValue(element.Customer_Name)
        this.form.get('startDate').setValue(new Date(this.ExcelDateToJSDate(element.Start_Date)))
        this.form.get('endDate').setValue(new Date(this.ExcelDateToJSDate(element.End_Date)))
        this.form.get('designation').setValue(element.Designation)

        !isNaN(element.no_of_Days) ? this.form.get('totalDays').setValue(element.no_of_Days)
          : this.form.get('totalDays').setValue(0)

        !isNaN(element.grand_Total) ? this.form.get('grandTotal').setValue(element.Grand_Total)
          : this.form.get('grandTotal').setValue(0)
      }

      var permissions = this.form.get('items') as FormArray;

      // item.get('billsAttached').setValue(element.Bills_Attached)
      item.get('expDate').setValue(this.ExcelDateToJSDate(element.Date))
      item.get('expNature').setValue(element.Nature_of_expense)
      item.get('expDetails').setValue(element.Details_of_the_expense)
      item.get('currency').setValue(element.Currency)

      !isNaN(element.Amount_in_BCY) ? item.get('bcyAmt').setValue(element.Amount_in_BCY)
        : item.get('bcyAmt').setValue(0)

      !isNaN(element.Amount_in_USD) ? item.get('usdAmt').setValue(element.Amount_in_USD)
        : item.get('usdAmt').setValue(0)

      item.get('remarks').setValue(element.Remarks)

      let calc = this.CalculateDateDiff(this.form.value.startDate, this.form.value.endDate)
      this.form.value.startDate = this.datepipe.transform(this.form.value.startDate, "MM/dd/yyyy");
      this.form.value.endDate = this.datepipe.transform(this.form.value.endDate, "MM/dd/yyyy");

      if (calc > -365)
        this.form.get('totalDays').value = calc
      else
        this.form.get('totalDays').value = 0

      let StartCalc = this.CalculateDateDiff(this.form.value.startDate, item.get('expDate').value)
      let EndCalc = this.CalculateDateDiff(item.get('expDate').value, this.form.value.endDate)


      if (this.form.get('totalDays').value != null && this.form.get('totalDays').value < 1)
        return this.notificationService.showError("The difference between Start Date and End Date should be more than 1 day !", "Error");

      if (StartCalc < 0 || EndCalc < 0) return this.notificationService.showError("Expense Date should be between Start Date and End Date", "Error")

      this.form.get('grandTotal').value += item.get('usdAmt').value
      this.form.get('startDate').value = this.datepipe.transform(this.form.get('startDate').value, "MM/dd/yyyy")
      this.form.get('endDate').value = this.datepipe.transform(this.form.get('endDate').value, "MM/dd/yyyy")

      if (item.get('expNature').value && item.get('expDetails').value && item.get('expDate').value) permissions.push(item)
      else return this.notificationService.showError("All Fields are required.", "Error in row data")
    });


    this.service.importData(this.form.value, "TREXP").pipe(first())
      .subscribe((data: any) => {
        this.form.reset()
        if (data.result) {
          this.notificationService.showSuccess(data.resultMessage, "Success")
          data.object.items.forEach(element => {
            delete element.currencyName
            delete element.expNatureName
            delete element.travelExpenseId
            delete element.id
            delete element.createdby
            delete element.createdon
            delete element.isactive
            delete element.isdeleted

            element.uploaded ? element.uploaded = "yes"
              : element.uploaded = "No"

            element.isBillsAttached ? element.isBillsAttached = "yes"
              : element.isBillsAttached = "No"
          });

          this.ExportTOExcel(data.object);

        }

        this.close()
      })
  }

  ExcelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date = new Date(utc_value * 1000);
    let datepipe = new DatePipe('en-US')
    return datepipe.transform(new Date(date), "MM/dd/yyyy");
  }

  ExportTOExcel(data: any) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.items);

    // XLSX.utils.sheet_add_aoa(ws, [['Purpose_of_Visit']], { origin: 'L1' });
    // XLSX.utils.sheet_add_aoa(ws, [[data.purpose_of_Visit]], { origin: 'L2' });

    XLSX.utils.sheet_add_aoa(ws, [['Employee_Name']], { origin: 'M1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.employeeName]], { origin: 'M2' });

    XLSX.utils.sheet_add_aoa(ws, [['Service_Request_No']], { origin: 'N1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.serviceRequestNo]], { origin: 'N2' });

    XLSX.utils.sheet_add_aoa(ws, [['Customer_Name']], { origin: 'O1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.customerName]], { origin: 'O2' });

    XLSX.utils.sheet_add_aoa(ws, [['Start_Date']], { origin: 'P1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.startDate]], { origin: 'P2' });

    XLSX.utils.sheet_add_aoa(ws, [['End_Date']], { origin: 'Q1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.endDate]], { origin: 'Q2' });

    XLSX.utils.sheet_add_aoa(ws, [['No_of_Days']], { origin: 'R1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.totalDays]], { origin: 'R2' });

    XLSX.utils.sheet_add_aoa(ws, [['Designation']], { origin: 'S1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.designation]], { origin: 'S2' });

    XLSX.utils.sheet_add_aoa(ws, [['Grand_Total']], { origin: 'T1' });
    XLSX.utils.sheet_add_aoa(ws, [[data.grandTotal]], { origin: 'T2' });


    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${this.datepipe.transform(new Date, "MM/dd/yyyy")}ExpenseUpload.xlsx`);
  }

  CalculateDateDiff(startDate, endDate) {
    let currentDate = new Date(startDate);
    let dateSent = new Date(endDate);

    return Math.floor(
      (Date.UTC(
        dateSent.getFullYear(),
        dateSent.getMonth(),
        dateSent.getDate()
      ) -
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        )) /
      (1000 * 60 * 60 * 24)
    );
  }


  close() {
    this.modalService.hide();
    this.notificationService.filter("itemadded");
  }

}
