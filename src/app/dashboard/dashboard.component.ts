import { Component, OnInit } from '@angular/core';

declare function CustomerDashboardCharts(): any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./css/material-dashboard.min.css', './css/nucleo-icons.css', './css/nucleo-svg.css']
})
export class DashboardComponent implements OnInit {
  ngOnInit() { 
    CustomerDashboardCharts()
  }
}
