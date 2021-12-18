import {Component, OnInit} from '@angular/core';
import {AccountService, CustdashboardsettingsService, ListTypeService} from "../_services";
import {ListTypeItem, User} from "../_models";
import {first} from "rxjs/operators";

declare function DistributorDashboardCharts(): any;

@Component({
  selector: 'app-distributordashboard',
  templateUrl: './distributordashboard.component.html',
  styleUrls: ['./distributordashboard.component.css']
})
export class DistributordashboardComponent implements OnInit {
  user: User;
  row1: string[]
  row2: string[]
  private rowdata1: ListTypeItem[];

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private SettingsService: CustdashboardsettingsService,
  ) {
  }

  ngOnInit() {
    DistributorDashboardCharts()
    this.user = this.accountService.userValue;

    this.SettingsService.getById(this.user.userId)
      .pipe(first())
      .subscribe({
        next: (data0: any) => {
          let data = data0.object
          console.log(data)
          if (data != null && data.length > 0 && data0.result) {
            data.forEach(x => {
              document.getElementById(x.graphNameCode).style.visibility = "visible";
            })

          }
        }
      })
  }
}
