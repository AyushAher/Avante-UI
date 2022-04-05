import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CountryService, SparePartService, CurrencyService, ListTypeService, UploadService
  , NotificationService, ProfileService, ConfigTypeValueService
} from '../_services';
import { ConfigTypeValue, ListTypeItem, User, ExportSparePart, Country, SparePart, Currency } from '../_models';
import * as XLSX from 'xlsx'; 


@Component({
  selector: 'app-sparepart',
  templateUrl: './export.html',
})
export class ExportSparePartComponent implements OnInit {
  user: User;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  listTypeItems: ListTypeItem[];
  configValueList: ConfigTypeValue[];
  configValueAllList: ConfigTypeValue[];
  exportSparePart: ExportSparePart[];
  countries: Country[];
  sparePart: SparePart;
  
  parttypes: ListTypeItem[];
  currency: Currency[];
  //configValueAllList: ConfigTypeValue[];
  fileName = 'ExcelSheet.xlsx';
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private countryService: CountryService,
    private sparePartService: SparePartService,
    private currencyService: CurrencyService,
    private listTypeService: ListTypeService,
    private uploadService: UploadService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private configService: ConfigTypeValueService
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.listTypeService.getById("CONTY")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.listTypeItems = data;
        },
        error: error => {
          
          this.loading = false;
        }
      });

    this.countryService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.countries = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currency = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });
     
    this.listTypeService.getById("PART")
      .pipe(first())
      .subscribe({
        next: (data: ListTypeItem[]) => {
          this.parttypes = data;
        },
        error: error => {
          
          this.loading = false;
        }
      });

    this.configService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configValueAllList = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });
  }

  onConfigChange(param: string) {
    this.configService.getById(param)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configValueList = data.object;
        },
        error: error => {
          
          this.loading = false;
        }
      });
  }

  onDropdownChange(value: string, configvalue: string) {
    //debugger;
    if (configvalue == "0") {
      configvalue = "";
    }
    
      // for (let i = 0; i < this.selectedConfigType.length; i++) {
      this.sparePartService.getByConfignValueId(value, configvalue)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.object.length > 0) {
              this.exportSparePart= data.object;
              this.exportexcel(data.object);
            }
          },
          error: error => {
            
            this.loading = false;
          }
        });
      // }
  }
  exportexcel(data:any): void {
    /* table id is passed over here */
    //   let element = document.getElementById('excel-table');
    data = data.filter(function (props) {
     // delete props.id;
      delete props.configTypeid;
      delete props.configValueid;
      delete props.partType;
      delete props.countryid;
      delete props.currencyid;
      delete props.image;
      delete props.replacepPartNoId;
      return true;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.countries);
    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.parttypes);
    const ws3: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.currency);
    const ws4: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.listTypeItems);
    const ws5: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.configValueAllList);


    //this.listTypeItems
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.utils.book_append_sheet(wb, ws1, 'Country');
    XLSX.utils.book_append_sheet(wb, ws2, 'PartType');
    XLSX.utils.book_append_sheet(wb, ws3, 'Currency');
    XLSX.utils.book_append_sheet(wb, ws4, 'ConfigType');
    XLSX.utils.book_append_sheet(wb, ws5, 'ConfigValue');
  /* save to file */
    
    XLSX.writeFile(wb, this.fileName);
    
  }

  uploadFile(event) {
    //debugger;
    let file = event.files[0];
    if (event.files && event.files[0]) {
      this.sparePartService.uploadSparePart(file)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            if (data.result == true) {
              // this.alertService.success('File Upload Successfully.');
              this.notificationService.showSuccess("File Upload Successfully", "Success");
            }
            else {
              
            }
            // this.imagePath = data.path;
            // console.log(data);

          },
          error: error => {
            
          }
        });
    }
  }
}
