import {createElement, Internationalization, L10n} from '@syncfusion/ej2-base';
import {Component, OnInit, ViewChild} from '@angular/core';
import {EventSettingsModel, PopupOpenEventArgs, ScheduleComponent} from '@syncfusion/ej2-angular-schedule';
import {DropDownList} from '@syncfusion/ej2-dropdowns';
import {first} from "rxjs/operators";
import {
  AccountService,
  ContactService,
  DistributorService,
  NotificationService,
  ServiceRequestService
} from "../_services";
import {ServiceRequest, User} from "../_models";
import {EngschedulerService} from "../_services/engscheduler.service";
import {DatePipe} from "@angular/common";

L10n.load({
  'en-US': {
    'schedule': {
      'saveButton': 'Add',
      'cancelButton': 'Close',
      'deleteButton': 'Remove',
      'newEvent': 'Add Event',
    },
  }
});

@Component({
  selector: 'app-engineerscheduler',
  templateUrl: './engineerscheduler.component.html'
})

export class EngineerschedulerComponent implements OnInit {

  srEngList: ServiceRequest[];
  loading = false;
  user: User;
  dataSrc = [];
  @ViewChild("scheduleObj")
  public scheduleObj: ScheduleComponent;
  private distId: any;
  public setView = "WorkWeek";

  constructor(
    private serviceRequestService: ServiceRequestService,
    private notificationService: NotificationService,
    private accountService: AccountService,
    private EngschedulerService: EngschedulerService,
    private contcactservice: ContactService,
    private distributorService: DistributorService,
    private datepipe: DatePipe
  ) {
  }

  public eventSettings: EventSettingsModel;

  onActionBegin(e) {
    console.log(e)
    if (e.requestType == "eventCreate") {
      console.log(e.data[0])
      e.data.forEach(x => {

        x.Id = x.Id.toString();
        x.StartTime = x.StartTime.toString();
        x.EndTime = x.EndTime.toString();

        this.EngschedulerService.save(x).pipe(first()).subscribe({
          next: (data: any) => {
            if (!data.result) {
              this.scheduleObj.deleteEvent(x.Id)
              this.scheduleObj.refreshEvents();
              this.notificationService.showError(data.message, "Error")
            }
          },
          error: (error) => {
            this.scheduleObj.deleteEvent(x.Id)
            this.scheduleObj.refreshEvents();
            this.notificationService.showError(error, "Error")
          }
        })
      })

    } else if (e.requestType == "eventChange") {
      console.log(e.data)

      this.EngschedulerService.update(e.data.Id, e.data).pipe(first()).subscribe({
        next: (data: any) => {
          if (!data.result) {
            this.scheduleObj.deleteEvent(e.data.Id)
            this.scheduleObj.refreshEvents();
            this.notificationService.showError(data.message, "Error")
          }
        },
        error: (error) => {
          this.scheduleObj.deleteEvent(e.data.Id)
          this.scheduleObj.saveEvent(e.data)
          this.scheduleObj.refreshEvents();
          this.notificationService.showError(error, "Error")
        }
      })
    } else if (e.requestType == "eventRemove") {
      console.log(e.data)
      e.data.forEach(x => {
        x.Id = x.Id.toString()
        this.EngschedulerService.delete(x.Id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (!data.result) {
                this.scheduleObj.deleteEvent(x.Id)
                this.scheduleObj.refreshEvents();
                this.notificationService.showError(data.message, "Error")
              }
            },
            error: (error: any) => {
              this.scheduleObj.saveEvent(x)
              this.scheduleObj.refreshEvents();

              this.notificationService.showError(error, "Error")
            }
          })
      })
    }
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    console.log(args)
    if (args.type === "QuickInfo") {
      args.cancel = true;
    }
    if (args.type === 'EventContainer') {
      let instance: Internationalization = new Internationalization();
      let date: string = instance.formatDate((<any>args.data).date, {skeleton: 'MMMEd'});
      ((args.element.querySelector('.e-header-date')) as HTMLElement).innerText = date;
      ((args.element.querySelector('.e-header-day')) as HTMLElement).innerText = 'Event count: ' + (<any>args.data).event.length;
    } else if (args.type === 'Editor') {
      // Create required custom elements in initial time
      if (!args.element.querySelector('.custom-servicereqno')) {
        let row: HTMLElement = createElement('div', {className: 'custom-servicereqno'});
        let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', {className: 'custom-field-container mt-3'});
        let inputEle: HTMLInputElement = createElement('input', {
          className: 'e-field', attrs: {name: 'SerReqId'}
        }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);
        let list = [];
        let dropDownList: DropDownList = new DropDownList({
          dataSource: list,
          fields: {text: 'text', value: 'value'},
          value: (<{ [key: string]: Object }>(args.data)).EventType as string,
          floatLabelType: 'Always', placeholder: 'Service Request No.'
        });

        this.serviceRequestService.getAll().pipe(first()).subscribe({
          next: (data: any) => {
            this.srEngList = data.object.filter(x => x.assignedto == this.user.contactId);
            if (data.object != null && data.object.length > 0) {
              this.srEngList.forEach(x => {
                list.push({text: x.serreqno, value: x.id})
              })
            }
            dropDownList = new DropDownList({
              dataSource: list,
              fields: {text: 'text', value: 'value'},
              value: (<{ [key: string]: Object }>(args.data)).EventType as string,
              floatLabelType: 'Always', placeholder: 'Service Request No.'
            });

          },
        })
        dropDownList.appendTo(inputEle);
        inputEle.setAttribute('name', 'SerReqId');
      }

      if (!args.element.querySelector('.custom-engname')) {
        let row: HTMLElement = createElement('div', {className: 'custom-engname'});
        let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');

        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', {className: 'custom-field-container mt-3'});
        let inputEle: HTMLInputElement = createElement('input', {
          className: 'e-field', attrs: {name: 'EngId'}
        }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);
        let list = [];
        let dropDownList: DropDownList = new DropDownList({
          dataSource: list,
          fields: {text: 'text', value: 'value'},
          value: (<{ [key: string]: Object }>(args.data)).EventType as string,
          floatLabelType: 'Always', placeholder: 'Engineer Name'
        });

        this.contcactservice.getDistByContact(this.user.contactId)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.distributorService.getDistributorRegionContacts(data.object.defdistid)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {
                    console.log(data)
                    if (data.object != null && data.object.length > 0) {
                      data.object.forEach(x => {
                        list.push({text: x.fname + " " + x.lname, value: x.id})
                      })
                    }
                    dropDownList = new DropDownList({
                      dataSource: list,
                      fields: {text: 'text', value: 'value'},
                      value: (<{ [key: string]: Object }>(args.data)).EventType as string,
                      floatLabelType: 'Always', placeholder: 'Engineer Name'
                    });
                  },

                });

            },
          })
        this.contcactservice.getDistByContact(this.user.contactId)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.distId = data.object.defdistid;
            },
            error: error => {
              //  this.alertService.error(error);
              this.notificationService.showSuccess(error, "Error");
              this.loading = false;
            }
          });
        dropDownList.appendTo(inputEle);
        inputEle.setAttribute('name', 'EngId');
      }
    }

  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.EngschedulerService.getAll().pipe(first()).subscribe({
      next: (data: any) => {
        data.object = data.object.filter(x => x.engId === this.user.contactId)
        if (data.result && data.object != [] && data.object != null) {
          data.object.forEach(x => {
            let obj = {
              Id: x.id,
              Subject: x.subject,
              Location: x.location,
              StartTime: new Date(x.startTime),
              EndTime: new Date(x.endTime),
              IsAllDay: x.isAllDay,
              IsBlock: x.isBlock,
              IsReadonly: x.isReadonly,
              RoomId: x.roomId,
              ResourceId: x.resourceId,
              Description: x.description,
              SerReqId: x.serReqId,
              EngId: x.engId,
            };
            this.dataSrc.push(obj);
          })
          this.eventSettings = {
            dataSource: this.dataSrc,
            fields: {
              id: 'Id',
              subject: {name: 'Subject'},
              location: {name: 'Location'},
              description: {name: 'Description'},
              startTime: {name: 'StartTime'},
              endTime: {name: 'EndTime'},

            }
          };
        }
      }
    })
  }
}
