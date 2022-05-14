import { trigger, transition, style, animate } from '@angular/animations';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models';
import { AccountService, CountryService, CustomerService, InstrumentService, NotificationService, DistributorRegionService } from '../_services';

@Component({
  selector: 'app-reportfilter',
  templateUrl: './reportfilter.component.html',
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ]
    )
  ],
})
export class ReportfilterComponent implements OnInit {

  @Output() nData = new EventEmitter<any[]>()
  @Output() showData = new EventEmitter<boolean>()

  @Input() controller: string;
  @Input() hasInstrument: boolean = true;
  @Input() isUserProfile: boolean = false;
  @Input() hasSite: boolean = true;

  form: FormGroup;
  modal: any;
  user: User
  nlist: any[] = []
  stage = 1;

  countryList: any;

  allRegionsList: any;
  regionsList: any[] = [];
  regionCountryList: any;
  customerList: any;
  siteList: any;
  instrumentList: any;
  siteBInstrumentList: any;
  customerBCountryList: any[] = []


  IsDist = false;
  IsCust = false;
  IsEng = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private instrumentService: InstrumentService,
    private notificationService: NotificationService,
    private regionService: DistributorRegionService
  ) { }

  ngOnInit(): void {
    this.user = this.accountService.userValue;
    var role = JSON.parse(localStorage.getItem('roles'));

    if (this.user.username != "admin") {
      role = role[0]?.itemCode;

      switch (role) {
        case environment.distRoleCode:
          this.IsDist = true
          this.IsCust = false
          this.IsEng = false
          break;

        case environment.custRoleCode:
          this.IsDist = false
          this.IsCust = true
          this.IsEng = false
          break;

        case environment.engRoleCode:
          this.IsDist = false
          this.IsCust = false
          this.IsEng = true
          break;

        default:
          this.IsDist = false
          this.IsCust = false
          this.IsEng = false
          break;
      }


    }

    this.form = this.formBuilder.group({
      region: ["", [Validators.required]],
      country: ["", [Validators.required]],
      customer: ["", [Validators.required]],
      site: [""],
      insSerialNo: [""]
    })

    this.accountService.GetUserRegions().pipe(first())
      .subscribe((data: any) => {
        this.regionService.getAll().pipe(first())
          .subscribe((dataReg: any) => {
            this.allRegionsList = dataReg;
            data.object.forEach(element => {
              if (element != "" && element != null) {
                this.regionsList.push(dataReg.find(x => x.id == element))
              }
            });
          })
      })

    this.countryService.getAll().pipe(first())
      .subscribe((coun: any) => {
        this.countryList = coun.object

        this.customerService.getAllByConId(this.user.contactId).pipe(first())
          .subscribe((data: any) => {
            this.customerList = data.object
            if (this.IsCust) {
              let cust = this.customerList[0]

              this.form.get('region').setValue(cust.defdistregionid)
              this.form.get('region').disable()
              this.onRegionChange()

              this.form.get('country').setValue(cust.countryid)
              this.form.get('country').disable()
              this.countryChange();

              setTimeout(() => {
                this.form.get('customer').setValue(cust.id)
                this.form.get('customer').disable()
                this.onCustomerChange()

                cust.sites.forEach(element => {
                  element.contacts.forEach(con => {
                    if (con.id == this.user.contactId) {
                      this.form.get('site').setValue(element.id)
                      this.form.get('site').disable()
                      this.SiteChange()
                    }
                  });
                });

              }, 300);
            }
          })
      })

    if (this.user.username == "admin") {
      this.customerService.getAll().pipe(first())
        .subscribe((data: any) => this.customerList = data.object)
    }

    if (this.hasInstrument) {
      this.instrumentService.getAll(this.user.userId).pipe(first())
        .subscribe((data: any) => this.instrumentList = data.object)
    }


  }

  onCustomerChange() {
    this.hasSite ? this.stage = 4 : this.stage = 6;
    this.siteList = this.customerList.find(x => x.id == this.form.get('customer').value).sites
    this.form.get('site').reset();
    if (this.isUserProfile) this.stage = 6
  }

  SiteChange() {
    this.hasInstrument ? this.stage = 5 : this.stage = 6;
    this.siteBInstrumentList = this.instrumentList.filter(x => x.custSiteId == this.form.get('site').value)
    setTimeout(() => this.form.get('insSerialNo').reset(), 200);
  }

  InstrumentChange() {
    this.stage = 6
  }

  countryChange() {
    this.stage = 3;
    this.customerBCountryList = this.customerList.filter(x => x.countryid == this.form.get('country').value)

    setTimeout(() => this.form.get('customer').reset(), 100);
  }

  onRegionChange() {
    this.stage = 2

    if (this.hasInstrument) {
      this.form.get('insSerialNo').setValidators([Validators.required])
      this.form.get('insSerialNo').updateValueAndValidity()
    }

    if (this.hasSite) {
      this.form.get('site').setValidators([Validators.required])
      this.form.get('site').updateValueAndValidity()
    }

    if (this.isUserProfile) {
      this.form.get('insSerialNo').updateValueAndValidity()
      this.form.get('insSerialNo').clearValidators();
      this.form.get('site').clearValidators();
      this.form.get('site').updateValueAndValidity()
    }

    var country = this.regionsList.find(x => x.id == this.form.get('region').value)?.countries
    this.regionCountryList = []

    country.split(',').forEach(x => {
      this.regionCountryList.push(this.countryList.find(element => element.id == x))
    });
  }

  clear() {
    this.showData.emit(false)
    this.form.reset();
    this.stage = 1

  }

  onSubmit() {
    if (this.form.valid) {
      this.modal = this.form.value

      this.instrumentService.getFilteredAll(this.modal, this.controller).pipe(first())
        .subscribe((data: any) => {
          this.nData.emit(data.object)
          this.showData.emit(true)
        })
    } else {
      this.notificationService.showError("Please fill all fields", "Form Invalid")
    }
  }

}
