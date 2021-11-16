import { Component, OnInit } from '@angular/core';

declare function DistributorDashboardCharts(): any;
@Component({
  selector: 'app-distributordashboard',
  templateUrl: './distributordashboard.component.html',
  styleUrls: ['./distributordashboard.component.css']
})
export class DistributordashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    DistributorDashboardCharts()
  }
}
