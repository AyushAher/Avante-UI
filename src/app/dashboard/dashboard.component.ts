import {Component, OnInit} from '@angular/core';
import {User} from "../_models";
import {AccountService, CustdashboardsettingsService, ListTypeService} from "../_services";
import {first} from "rxjs/operators";

declare function CustomerDashboardCharts(): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./css/material-dashboard.min.css', './css/nucleo-icons.css', './css/nucleo-svg.css']
})
export class DashboardComponent implements OnInit {
  user: User;
  row1: string[]
  row2: string[]
  row3: string[]

  constructor(
    private accountService: AccountService,
    private listTypeService: ListTypeService,
    private SettingsService: CustdashboardsettingsService,
  ) {
  }

  ngOnInit() {
    CustomerDashboardCharts()
    this.user = this.accountService.userValue;

    this.SettingsService.getById(this.user.userId)
      .pipe(first())
      .subscribe({
        next: (data0: any) => {
          let data = data0.object
          if (data != null && data.length > 0 && data0.result) {
            data.forEach(x => {
              document.getElementById(x.graphNameCode).style.display = "block";
            })

          }
        }
      })
  }
}
