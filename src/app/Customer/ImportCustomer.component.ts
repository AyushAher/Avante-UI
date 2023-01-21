import { DatePipe } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import * as XLSX from 'xlsx'
import { CustomerService, DistributorService, NotificationService } from '../_services';

@Component({
    selector: 'app-importcustomer',
    templateUrl: './ImportCustomer.component.html',
})
export class ImportCustomerData {

    file: any;
    arrayBuffer: any;
    fileData: any
    form: any
    datepipe: any = new DatePipe('en-US');
    @ViewChild('files') files: any

    constructor(
        private modalService: BsModalService,
        private notificationService: NotificationService,
        private customerService: CustomerService
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

        var worksheet = workbook.Sheets["Customer"];
        // this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })

        // workbookData["customer"] = []
        // this.fileData.forEach((ele: any) => {
        //     var element = {};
        //     element["industrySegment"] = ele["Industry Segment"]
        //     element["custname"] = ele.Name
        //     element["countryName"] = ele["Country"]
        //     element["defdistid"] = ele["Default Distributor"]
        //     element["defdistregionid"] = ele["Distributor Regions"]
        //     element["address"] = {
        //         area: ele.Area?.toString(),
        //         street: ele.Street?.toString(),
        //         place: ele.Place?.toString(),
        //         city: ele.City?.toString(),
        //         countryName: ele.Country?.toString(),
        //         zip: ele.Zip?.toString(),
        //         geolat: ele.Latitude?.toString(),
        //         geolong: ele.Longitude?.toString(),
        //     };
        //     workbookData["customer"].push(element);
        // });

        // worksheet = workbook.Sheets["Customer Contact"];
        // this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })

        // workbookData["customerContact"] = []
        // this.fileData.forEach((ele: any) => {
        //     var element = {};
        //     element["whatsappNo"] = ele["WhatsApp No"]?.toString();
        //     element["semail"] = ele["Secondory Email"];
        //     element["pemail"] = ele["Primary Email"];
        //     element["scontactno"] = ele["Secondory Contact No"]?.toString();
        //     element["pcontactno"] = ele["Primary Contact No"]?.toString();
        //     element["designation"] = ele["Designation"];
        //     element["fName"] = ele["First Name"];
        //     element["lName"] = ele["Last Name"];
        //     element["mName"] = ele["Middle Name"];
        //     element["parentId"] = ele["Customer"];
        //     element["address"] = {
        //         area: ele.Area?.toString(),
        //         street: ele.Street?.toString(),
        //         place: ele.Place?.toString(),
        //         city: ele.City?.toString(),
        //         countryName: ele.Country?.toString(),
        //         zip: ele.Zip?.toString(),
        //         geolat: ele.Latitude?.toString(),
        //         geolong: ele.Longitude?.toString(),
        //     };
        //     workbookData["customerContact"].push(element);
        // });


        worksheet = workbook.Sheets["Customer Site Contact"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
        
        workbookData["siteContact"] = []
        this.fileData.forEach((ele: any) => {
            var element = {};
            element["parentId"] = ele["Site"];
            element["whatsappNo"] = ele["WhatsApp No"]?.toString();
            element["semail"] = ele["Secondory Email"];
            element["pemail"] = ele["Primary Email"];
            element["scontactno"] = ele["Secondory Contact No"]?.toString();
            element["pcontactno"] = ele["Primary Contact No"]?.toString();
            element["designation"] = ele["Designation"];
            element["fName"] = ele["First Name"];
            element["lName"] = ele["Last Name"];
            element["mName"] = ele["Middle Name"];
            element["address"] = {
                area: ele.Area?.toString(),
                street: ele.Street?.toString(),
                place: ele.Place?.toString(),
                city: ele.City?.toString(),
                countryName: ele.Country?.toString(),
                zip: ele.Zip?.toString(),
                geolat: ele.Latitude?.toString(),
                geolong: ele.Longitude?.toString(),
            };
            workbookData["siteContact"].push(element);
        });


        worksheet = workbook.Sheets["Customer Site"];
        this.fileData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
        workbookData["customerSite"] = []
        this.fileData.forEach((ele: any) => {
            var element = {};
            element["custid"] = ele["Customer"];
            element["regname"] = ele["Region Name"];
            element["custregname"] = ele["Site Name"];
            element["regionalDistributor"] = ele["Regional Distributor"];
            element["payterms"] = ele["Payment Terms"];

            if (typeof element["payterms"] == "number")
                element["payterms"] = element["payterms"]?.toString()

            element["address"] = {
                area: ele.Area?.toString(),
                street: ele.Street?.toString(),
                place: ele.Place?.toString(),
                city: ele.City?.toString(),
                countryName: ele.Country?.toString(),
                zip: ele.Zip?.toString(),
                geolat: ele.Latitude?.toString(),
                geolong: ele.Longitude?.toString(),
            };
            workbookData["customerSite"].push(element);
        });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        // this.customerService.importData(workbookData)
        //     .pipe(first()).subscribe(() => this.close())

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