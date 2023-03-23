import { ChangeDetectorRef, Component, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import ChangeCIM from '../account/ChangeCIM.component';
import { User } from '../_models';
import { AccountService } from '../_services';
import { LoaderService } from '../_services/loader.service';

@Component({
  selector: 'layout',
  templateUrl: './layout.html',
})
export class LayoutComponent implements OnInit {
  @Input("showNavs") showNavs: boolean;
  @Input("isNewSetUp") isNewSetUp: boolean;

  shownotifications: boolean = false;
  bsModalRef: BsModalRef;

  showSpinner = false;
  isClosed: any;
  hideBreadCrumbs: boolean = false
  user: User

  constructor(
    private spinnerService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.spinnerService.getSpinnerObserver().subscribe((status) => {
      this.showSpinner = (status === 'start');
      this.cdRef.detectChanges();
    });

    this.route.url.subscribe(data => {
      data.forEach(x => {
        this.hideBreadCrumbs = this.HideBreadCrumbRoutes.find(y => y == x.path) != null;
      });
      if (data.length == 0) this.hideBreadCrumbs = true
    })
  }

  Notifications(event) {
    this.shownotifications = event;
  }

  popUpClosed(event) {
    this.isClosed = event
  }


  private HideBreadCrumbRoutes: string[] = ['', 'distdashboard', 'custdashboard'];
}
