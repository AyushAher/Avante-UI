import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
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

  constructor(private EngDashboardService: EngdashboardService) { }

  ngOnInit() {
    this.currentCalender = this.calenderLst[0];
    this.GetData()
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
    EngDashboardCharts()
  }

  CalenderChange(date) {
    this.currentCalender = date
    this.GetData();
  }
}
