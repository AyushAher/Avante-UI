import { DatePipe } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as XLSX from 'xlsx'
import { NotificationService } from '../_services';

@Component({
    selector: 'app-inportdataofferrequest',
    templateUrl: './importofferrequest.component.html',
})

export class ImportOfferRequestComponent implements OnInit {

    file: any;
    arrayBuffer: any;
    fileData: any
    form: any
    datepipe: any = new DatePipe('en-US');
    @ViewChild('files') files: any

    constructor(
        private modalService: BsModalService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {

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
            this.submitData(workbook)

        }
    }

    submitData(workbook: XLSX.WorkBook) {
        var worksheet = workbook.Sheets["SparePartQuotation"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
        console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
    }

    ExcelDateToJSDate(serial) {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);
        let datepipe = new DatePipe('en-US')

        return datepipe.transform(date_info, "dd/MM/YYYY");
    }

    ExportTOExcel(data: any) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data.object);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${this.datepipe.transform(new Date, "dd/MM/YYYY")}Upload.xlsx`);
    }
    close() {
        this.modalService.hide();
        this.notificationService.filter("itemadded");
    }
}