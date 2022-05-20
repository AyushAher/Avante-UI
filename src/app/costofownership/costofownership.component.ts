import { DatePipe } from '@angular/common';
import { AfterContentChecked, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { AmcService, InstrumentService, NotificationService } from '../_services';
import { CustomerdashboardService } from '../_services/customerdashboard.service';

@Component({
  selector: 'app-costofownership',
  templateUrl: './costofownership.component.html',
})
export class CostofownershipComponent implements OnInit {
  @Input() instrumentId: string;
  costOfInstrument: number = 0;
  dateOfPurchased: Date | string;
  insSerialNo: string;
  ownerShip: any[] = []
  datePipe = new DatePipe('en-US')
  insCostCurrency:string;

  constructor(
    private customerDashboard: CustomerdashboardService,
    public activeModal: BsModalService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }
  // ngAfterContentChecked(): void {

  // }

  ngOnInit(): void {
    // this.instrumentId = this.route.snapshot.paramMap.get('id');
    this.customerDashboard.GetCostOfOwnerShip(this.instrumentId)
      .pipe(first()).subscribe((data: any) => {
        this.insSerialNo = data.object.insSerialNo;
        this.costOfInstrument = data.object.insCost;
        this.dateOfPurchased = data.object.dateOfPurchase;
        this.ownerShip = data.object.ownerShip;
        this.insCostCurrency = data.object.insCostCurrency;
      })
  }


  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

}
