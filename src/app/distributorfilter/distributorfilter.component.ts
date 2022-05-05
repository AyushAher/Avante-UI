import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { User } from '../_models';
import { AccountService, CountryService, CustomerService, DistributorService, InstrumentService } from '../_services';

@Component({
  selector: 'app-distributorfilter',
  templateUrl: './distributorfilter.component.html',
})
export class DistributorfilterComponent implements OnInit {

  @Output() nData = new EventEmitter<any[]>()

  @Input() controller: string;
  @Input() hasInstrument: boolean = true;

  form: FormGroup;
  modal: any;
  nlist: any[] = []
  user: User
  regionsList: any;
  countryList: any;
  regionCountryList: any;
  customerList: any;
  siteList: any;
  instrumentList: any;

  constructor(
    private formBuilder: FormBuilder,
    private distributorService: DistributorService,
    private accountService: AccountService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private instrumentService: InstrumentService,

  ) { }

  ngOnInit(): void {
    this.user = this.accountService.userValue;

    this.form = this.formBuilder.group({
      region: [],
      country: [],
      customer: [],
      site: [],
      insSerialNo: []
    })

    this.distributorService.getByConId(this.user.contactId).pipe(first())
      .subscribe((data: any) => this.regionsList = data.object[0].regions)

    this.countryService.getAll().pipe(first())
      .subscribe((data: any) => this.countryList = data.object)

    this.customerService.getAllByConId(this.user.contactId).pipe(first())
      .subscribe((data: any) => this.customerList = data.object)

    if (this.hasInstrument) {
      this.instrumentService.getAll(this.user.userId).pipe(first())
        .subscribe((data: any) => this.instrumentList = data.object)
    }


  }

  onCustomerChange() {
    this.siteList = this.customerList.find(x => x.id == this.form.get('customer').value).sites
    this.form.get('site').reset();
  }

  onRegionChange() {
    var country = this.regionsList.find(x => x.id == this.form.get('region').value)?.countries
    this.regionCountryList = []

    country.split(',').forEach(x => {
      this.regionCountryList.push(this.countryList.find(element => element.id == x))
    });
  }

  clear() {
    // this.nData.emit(this.list)
    this.form.reset();
    
  }

  onSubmit() {
    this.modal = this.form.value

    this.instrumentService.getFilteredAll(this.modal, this.controller).pipe(first())
      .subscribe((data: any) => {
        this.nData.emit(data.object)
      })
  }

}
