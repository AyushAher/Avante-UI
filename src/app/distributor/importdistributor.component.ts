import { DatePipe } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import * as XLSX from 'xlsx'
import { DistributorService, NotificationService } from '../_services';

@Component({
    selector: 'app-inportdataofferrequest',
    templateUrl: './importdistributor.component.html',
})

export class ImportDistributorComponent {

    file: any;
    arrayBuffer: any;
    fileData: any
    form: any
    datepipe: any = new DatePipe('en-US');
    @ViewChild('files') files: any

    constructor(
        private modalService: BsModalService,
        private notificationService: NotificationService,
        private distributorService: DistributorService
    ) { }

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
        var workbookData = {}

        var worksheet = workbook.Sheets["Distributor"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })

        workbookData["distributor"] = []
        this.fileData.forEach((ele: any) => {
            var element = {};
            element["distName"] = ele.Name
            element["payTerms"] = ele["Payment Terms"]
            element["address"] = {
                area: ele.Area,
                street: ele.Street,
                place: ele.Place,
                city: ele.City,
                countryName: ele.Country,
                zip: ele.Zip?.toString(),
                geolat: ele.Latitude?.toString(),
                geolong: ele.Longitude?.toString(),
            };
            workbookData["distributor"].push(element);
        });

        worksheet = workbook.Sheets["Distributor Contact"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
        workbookData["distributorContact"] = []
        this.fileData.forEach((ele: any) => {
            var element = {};
            element["whatsappNo"] = ele["WhatsApp No"];
            element["semail"] = ele["Secondory Email"];
            element["pemail"] = ele["Primary Email"];
            element["scontactno"] = ele["Secondory Contact No"];
            element["pcontactno"] = ele["Primary Contact No"];
            element["designation"] = ele["Designation"];
            element["fName"] = ele["First Name"];
            element["lName"] = ele["Last Name"];
            element["mName"] = ele["Middle Name"];
            element["parentId"] = ele["Distributor"];
            element["address"] = {
                area: ele.Area,
                street: ele.Street,
                place: ele.Place,
                city: ele.City,
                countryName: ele.Country,
                zip: ele.Zip?.toString(),
                geolat: ele.Latitude?.toString(),
                geolong: ele.Longitude?.toString(),
            };
            workbookData["distributorContact"].push(element);
        });


        worksheet = workbook.Sheets["Distributor Region Contact"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
        workbookData["distributorRegionContact"] = []
        this.fileData.forEach((ele: any) => {

            var element = {};
            element["whatsappNo"] = ele["WhatsApp No"];
            element["semail"] = ele["Secondory Email"];
            element["pemail"] = ele["Primary Email"];
            element["scontactno"] = ele["Secondory Contact No"];
            element["pcontactno"] = ele["Primary Contact No"];
            element["designation"] = ele["Designation"];
            element["fName"] = ele["First Name"];
            element["lName"] = ele["Last Name"];
            element["mName"] = ele["Middle Name"];
            element["parentId"] = ele["Region"];
            element["address"] = {
                area: ele.Area,
                street: ele.Street,
                place: ele.Place,
                city: ele.City,
                countryName: ele.Country,
                zip: ele.Zip?.toString(),
                geolat: ele.Latitude?.toString(),
                geolong: ele.Longitude?.toString(),
            };
            workbookData["distributorRegionContact"].push(element);
        });


        worksheet = workbook.Sheets["Distributor Region"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
        workbookData["distributorRegion"] = []
        this.fileData.forEach((ele: any) => {

            var element = {};
            element["distId"] = ele["Distributor"];
            element["region"] = ele["Region Name"];
            element["distregname"] = ele["Regional Distributor"];
            element["payterms"] = ele["Payment Terms"];
            element["countries"] = ele["Countries"];
            element["address"] = {
                area: ele.Area,
                street: ele.Street,
                place: ele.Place,
                city: ele.City,
                countryName: ele.Country,
                zip: ele.Zip?.toString(),
                geolat: ele.Latitude?.toString(),
                geolong: ele.Longitude?.toString(),
            };
            workbookData["distributorRegion"].push(element);
        });

        this.distributorService.ImportData(workbookData)
            .pipe(first()).subscribe(() => this.close())

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