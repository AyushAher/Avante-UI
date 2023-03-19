import { ChangeDetectorRef, Component, Input, OnInit, Output } from '@angular/core';
import { LoaderService } from '../_services/loader.service';

@Component({
  selector: 'layout',
  templateUrl: './layout.html',
})
export class LayoutComponent implements OnInit {
  @Input("showNavs") showNavs: boolean;
  @Input("isNewSetUp") isNewSetUp: boolean;

  shownotifications: boolean = false;

  showSpinner = false;
  isClosed: any;

  constructor(private spinnerService: LoaderService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.spinnerService.getSpinnerObserver().subscribe((status) => {
      this.showSpinner = (status === 'start');
      this.cdRef.detectChanges();
    });
  }

  Notifications(event) {
    this.shownotifications = event;
  }

  popUpClosed(event) {
    this.isClosed = event
  }
}
