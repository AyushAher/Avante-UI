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

          this.row1 = data0.object.row1.split(",")

          if (this.row1 != []) {
            this.row1.forEach((value, index) => {
              document.getElementById(value).style.visibility = 'visible'
            })
          }

          if (this.row2 != []) {
            this.row2 = data0.object.row2.split(",")
            this.row2.forEach((value, index) => {
              document.getElementById(value).style.visibility = 'visible'
            })
          }
          if (this.row3 != []) {
            this.row3 = data0.object.row3.split(",")
            this.row3.forEach((value, index) => {
              document.getElementById(value).style.visibility = 'visible'
            })
          }

          this.listTypeService
            .getById("CDRW1")
            .pipe(first())
            .subscribe({
              next: (data1: any) => {
                for (var i in data1) {
                  if (!this.row1.includes(data1[i].listTypeItemId)) {
                    document.getElementById((data1[i].listTypeItemId)).style.display = 'none';
                  }
                }
              }
            });

          this.listTypeService
            .getById("CDRW2")
            .pipe(first())
            .subscribe({
              next: (data2: any) => {
                for (var i in data2) {
                  if (!this.row1.includes(data2[i].listTypeItemId)) {
                    document.getElementById((data2[i].listTypeItemId)).style.display = 'none';
                  }
                }
              }
            });

          this.listTypeService
            .getById("CDRW3")
            .pipe(first())
            .subscribe({
              next: (data3: any) => {
                for (var i in data3) {

                  if (!this.row3.includes(data3[i].listTypeItemId)) {
                    document.getElementById((data3[i].listTypeItemId)).style.display = 'none';
                  }
                }
              }
            });
        }
      })
  }
}
