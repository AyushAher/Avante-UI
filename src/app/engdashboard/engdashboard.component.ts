import { Component, OnInit, ViewChild } from '@angular/core';
import { delay, first } from 'rxjs/operators';
import { ProfileReadOnly, User } from '../_models';
import { AccountService, ProfileService } from '../_services';
import { EngdashboardService } from '../_services/engdashboard.service';

declare function EngDashboardCharts(): any;

@Component({
  selector: 'app-engdashboard',
  templateUrl: './engdashboard.component.html',
})

export class EngdashboardComponent implements OnInit {
  spRecom: any[]
  spCon: any[]
  currentCalender: string;
  calenderLst = ["3MNTHS", "6MNTHS", "12MNTHS"]
  pendingSerReq: any;
  compSerReq: any;

  @ViewChild('MNTHS3') Mnths3;
  @ViewChild('MNTHS6') Mnths6;
  @ViewChild('MNTHS12') Mnths12;
  travelExpense: any;

  constructor(private EngDashboardService: EngdashboardService) { }

  ngOnInit() {
    this.CalenderChange(this.calenderLst[0])
  }

  GetData() {
    this.EngDashboardService.GetCompSerReq(this.currentCalender).pipe(first())
      .subscribe((data: any) => {
        var pendingReqLabels = []
        var pendingReqValues = []

        var compReqValues = []
        var compReqLabels = []

        var serReqData = data.object;

        this.pendingSerReq = serReqData.filter(x => !x.isReportGenerated);
        this.compSerReq = serReqData.filter(x => x.isReportGenerated);

        this.pendingSerReq.forEach(x => {
          if (!pendingReqLabels.find(y => y == x.serviceType)) pendingReqLabels.push(x.serviceType)
        });

        pendingReqLabels.forEach(x => pendingReqValues.push(this.pendingSerReq.filter(y => y.serviceType == x).length))

        this.compSerReq.forEach(x => {
          if (!compReqLabels.find(y => y == x.serviceType)) compReqLabels.push(x.serviceType)
        });

        compReqLabels.forEach(x => compReqValues.push(this.compSerReq.filter(y => y.serviceType == x).length))

        localStorage.setItem("pendingSerReq", JSON.stringify({ pendingReqLabels, pendingReqValues }))
        localStorage.setItem("compSerReq", JSON.stringify({ compReqLabels, compReqValues }))
      })

    this.EngDashboardService.GetSPCon(this.currentCalender).pipe(first())
      .subscribe((data: any) => this.spCon = data.object)

    this.EngDashboardService.GetSPRecomm(this.currentCalender).pipe(first())
      .subscribe((data: any) => this.spRecom = data.object)

    this.EngDashboardService.GetTravelExpenses(this.currentCalender)
      .pipe(first()).subscribe((data: any) => {
        this.travelExpense = data.object
        if (!data.object) {
          this.travelExpense = {
            localTravel: 0,
            airTicket: 0,
            da: 0,
            hotel: 0,
            others: 0,
            visaRelated: 0,
            total: 0,
            advanceRequest: 0
          }
        }

      })

    setTimeout(() => EngDashboardCharts(), 1500);
  }

  async CalenderChange(date) {
    this.currentCalender = date
    this.GetData();
    await delay(2000)
    if (date == this.calenderLst[0]) {
      this.Mnths3.nativeElement.classList.add('active')
      this.Mnths6.nativeElement.classList.remove('active')
      this.Mnths12.nativeElement.classList.remove('active')
    }
    else if (date == this.calenderLst[1]) {
      this.Mnths6.nativeElement.classList.add('active')
      this.Mnths3.nativeElement.classList.remove('active')
      this.Mnths12.nativeElement.classList.remove('active')
    }
    else if (date == this.calenderLst[2]) {
      this.Mnths12.nativeElement.classList.add('active')
      this.Mnths6.nativeElement.classList.remove('active')
      this.Mnths3.nativeElement.classList.remove('active')
    }

  }
}
