import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { User } from '../_models';
import { AccountService, CountryService, CustomerService, DistributorRegionService, InstrumentService, NotificationService } from '../_services';

@Component({
  selector: 'app-distributorfilter',
  templateUrl: './distributorfilter.component.html',
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
export class DistributorfilterComponent implements OnInit {

  @Output() nData = new EventEmitter<any[]>()
  @Output() showData = new EventEmitter<boolean>()

  @Input() controller: string;
  @Input() hasInstrument: boolean = true;
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
      .subscribe((data: any) => this.countryList = data.object)

    if (this.user.username == "admin") {
      this.customerService.getAll().pipe(first())
        .subscribe((data: any) => this.customerList = data.object)
    }
    else {
      this.customerService.getAllByConId(this.user.contactId).pipe(first())
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
    console.log(this.customerList);

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

    var country = this.regionsList.find(x => x.id == this.form.get('region').value)?.countries
    this.regionCountryList = []

    country.split(',').forEach(x => {
      this.regionCountryList.push(this.countryList.find(element => element.id == x))
    });
  }

  clear() {
    // this.nData.emit(this.list)
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
