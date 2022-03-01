import { createElement, Internationalization, L10n } from '@syncfusion/ej2-base';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EventSettingsModel, GroupModel, PopupOpenEventArgs, ScheduleComponent } from '@syncfusion/ej2-angular-schedule';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { first } from "rxjs/operators";
import {
  AccountService,
  ContactService,
  DistributorService,
  ListTypeService,
  NotificationService,
  ProfileService,
  ServiceRequestService
} from "../_services";
import { ProfileReadOnly, ServiceRequest, User } from "../_models";
import { EngschedulerService } from "../_services/engscheduler.service";
import { DatePipe } from "@angular/common";
import { environment } from "../../environments/environment";
import { ActivatedRoute } from "@angular/router";

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
  isEng: boolean = false;
  isDistSupp: boolean = false;

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isAdmin: boolean = false;
  id: string;
  link: string;
  constructor(
    private serviceRequestService: ServiceRequestService,
    private notificationService: NotificationService,
    private accountService: AccountService,
    private EngschedulerService: EngschedulerService,
    private contcactservice: ContactService,
    private distributorService: DistributorService,
    private datepipe: DatePipe,
    private listTypeService: ListTypeService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
  ) {
  }

  public eventSettings: EventSettingsModel;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.link = `/servicerequest/${this.id}`
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCDLE");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.username == "admin") {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasReadAccess = true;
      this.hasUpdateAccess = true;
      this.isAdmin = true;
    }


    this.listTypeService.getById("ROLES")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data = data.filter(x => x.listTypeItemId == this.user.roleId)[0]
          if (data?.itemCode == environment.engRoleCode) {
            this.isEng = true
          } else if (data?.itemCode == environment.distRoleCode) {
            this.isDistSupp = true
          }
          if (this.isEng) {
            this.isEng = true;
            this.EngschedulerService.getByEngId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (Engdata: any) => {
                  Engdata.object = Engdata.object.filter(x => x.engId === this.user.contactId)
                  if (Engdata.result && Engdata.object != [] && Engdata.object != null) {
                    Engdata.object.forEach(x => {
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
                        RecurrenceRule: x.recurrenceRule,
                        RecurrenceException: x.RecurrenceException,
                        StartTimezone: x.StartTimezone,
                        EndTimezone: x.EndTimezone,
                      };
                      this.dataSrc.push(obj);
                    })
                    this.eventSettings = {

                      dataSource: this.dataSrc,
                      fields: {
                        id: 'Id',
                        subject: { name: 'Subject' },
                        location: { name: 'Location' },
                        description: { name: 'Description' },
                        startTime: { name: 'StartTime' },
                        endTime: { name: 'EndTime' },

                      }
                    };
                  }
                }
              })
          } else if (this.isDistSupp) {
            this.isDistSupp = true;
            let DistData = [];
            this.distributorService.GetDistributorRegionContactsByContactId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (Distdata: any) => {
                  if (Distdata.result && Distdata.object != null) {
                    Distdata.object.forEach(x => {
                      this.EngschedulerService.getByEngId(x.id)
                        .pipe(first())
                        .subscribe({
                          next: (engSch: any) => {
                            if (engSch.object != null && engSch.object.length > 0) {
                              engSch = engSch.object;
                              engSch.forEach(y => {
                                let obj = {
                                  Id: y.id,
                                  Subject: y.subject,
                                  Location: y.location,
                                  StartTime: new Date(y.startTime),
                                  EndTime: new Date(y.endTime),
                                  IsAllDay: y.isAllDay,
                                  IsBlock: y.isBlock,
                                  IsReadonly: y.isReadonly,
                                  RoomId: y.roomId,
                                  ResourceId: y.roomId,
                                  Description: y.description,
                                  SerReqId: y.serReqId,
                                  RecurrenceRule: y.recurrenceRule,
                                  RecurrenceException: y.RecurrenceException,
                                  StartTimezone: y.StartTimezone,
                                  EndTimezone: y.EndTimezone,
                                };
                                DistData.push(obj);
                              })
                            }
                          }
                        })
                      this.roomDataSource.push({ text: x.fname + " " + x.lname, id: x.id, startHour: "09:00" })
                    })
                  }
                }
              })

            this.eventSettings = {
              dataSource: DistData,
            };
          }

        },
        error: error => {
          this.notificationService.showError(error, "Error");
        }
      });
  }

  onActionBegin(e) {

    if (e.requestType == "eventCreate") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          x.Id = x.Id.toString();
          if (x.SerReqId != null) {
            this.serviceRequestService.getById(x.SerReqId)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  data = data.object;
                  let serReqDate = new Date(data.serreqdate)
                  let SDate: Date = x.StartTime;
                  let diff = SDate.valueOf() - serReqDate.valueOf()
                  if (diff >= 0) {
                    x.StartTime = x.StartTime.toString();
                    x.EndTime = x.EndTime.toString();
                    x.EngId = this.user.contactId;
                    x.RoomId = this.user.contactId;
                    x.isactive = true;
                    x.isdeleted = true;

                    this.EngschedulerService.save(x).pipe(first()).subscribe({
                      next: (data: any) => {
                        if (!data.result) {
                          this.scheduleObj.deleteEvent(x)
                          this.scheduleObj.refreshEvents();
                          this.notificationService.showError(data.message, "Error")
                        }
                      },
                      error: (error) => {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();
                        this.notificationService.showError(error, "Error")
                      }
                    })

                  } else {
                    this.notificationService.showError("Start Date Should Be greater than or Equal" +
                      " to Service Request Date", "Error")
                    this.scheduleObj.deleteEvent(x)
                    this.scheduleObj.refreshEvents();
                  }
                },
                error: (error: any) => {
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                  this.notificationService.showError(error, "Error")
                }
              });
          } else {
            this.notificationService.showError("Service Request Field Required", "Error")
          }

        })
      } else {
        let x = e.data;
        x.Id = x.Id.toString();
        if (x.SerReqId != null) {
          this.serviceRequestService.getById(x.SerReqId)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                data = data.object;
                let serReqDate = new Date(data.serreqdate)
                let SDate: Date = x.StartTime;
                let diff = SDate.valueOf() - serReqDate.valueOf()
                if (diff >= 0) {
                  x.StartTime = x.StartTime.toString();
                  x.EndTime = x.EndTime.toString();
                  x.EngId = this.user.contactId;
                  x.RoomId = this.user.contactId;
                  x.isactive = true;
                  x.isdeleted = true;

                  this.EngschedulerService.save(x).pipe(first()).subscribe({
                    next: (data: any) => {
                      if (!data.result) {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();
                        this.notificationService.showError(data.message, "Error")
                      }
                    },
                    error: (error) => {
                      this.scheduleObj.deleteEvent(x)
                      this.scheduleObj.refreshEvents();
                      this.notificationService.showError(error, "Error")
                    }
                  })

                } else {
                  this.notificationService.showError("Start Date Should Be greater than or Equal" +
                    " to Service Request Date", "Error")
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                }
              },
              error: (error: any) => {
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();
                this.notificationService.showError(error, "Error")
              }
            });
        } else {
          this.notificationService.showError("Service Request Field Required", "Error")
        }
      }

    } else if (e.requestType == "eventChange") {

      this.EngschedulerService.update(e.data.Id, e.data).pipe(first()).subscribe({
        next: (data: any) => {
          if (!data.result) {
            this.scheduleObj.deleteEvent(e.data)
            this.scheduleObj.refreshEvents();
            this.notificationService.showError(data.message, "Error")
          }
        },
        error: (error) => {
          this.scheduleObj.deleteEvent(e.data)
          this.scheduleObj.saveEvent(e.data)
          this.scheduleObj.refreshEvents();
          this.notificationService.showError(error, "Error")
        }
      })
    } else if (e.requestType == "eventRemove") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          x.Id = x.Id.toString()
          this.EngschedulerService.delete(x.Id)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (!data.result) {
                  this.scheduleObj.deleteEvent(x)
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
      } else {
        let x = e.data;
        x.Id = x.Id.toString()
        this.EngschedulerService.delete(x.Id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (!data.result) {
                this.scheduleObj.deleteEvent(x)
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
      }
    }
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    if (args.type === "QuickInfo") {
      args.cancel = true;
    }
    if (args.type === 'EventContainer') {
      let instance: Internationalization = new Internationalization();
      let date: string = instance.formatDate((<any>args.data).date, { skeleton: 'MMMEd' });
      ((args.element.querySelector('.e-header-date')) as HTMLElement).innerText = date;
      ((args.element.querySelector('.e-header-day')) as HTMLElement).innerText = 'Event count: ' + (<any>args.data).event.length;
    } else if (args.type === 'Editor') {
      if (this.id == null) args.cancel = true;
      if (!this.hasUpdateAccess) {
        args.element.querySelector('.e-event-save ')?.setAttribute('disabled', 'true')
      }
      // Create required custom elements in initial time
      if (!args.element.querySelector('.custom-servicereqno')) {
        let row: HTMLElement = createElement('div', { className: 'custom-servicereqno' });
        let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', { className: 'custom-field-container mt-3' });
        let inputEle: HTMLInputElement = createElement('input', {
          className: 'e-field', attrs: { name: 'SerReqId', disable: 'true' }
        }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);
        let list = [];
        let dropDownList: DropDownList = new DropDownList({
          dataSource: list,
          fields: { text: 'text', value: 'value' },
          value: (<{ [key: string]: Object }>(args.data)).EventType as string,
          floatLabelType: 'Always', placeholder: 'Service Request No.'
        });

        this.serviceRequestService.getAll(this.user.userId).pipe(first()).subscribe({
          next: (data: any) => {
            this.srEngList = data.object.filter(x => x.assignedto == this.user.contactId);
            if (data.object != null && data.object.length > 0) {
              this.srEngList.forEach(x => {
                list.push({ text: x.serreqno, value: x.id })
              })
            }
            dropDownList = new DropDownList({
              dataSource: list,
              fields: { text: 'text', value: 'value' },
              value: (<{ [key: string]: Object }>(args.data)).EventType as string,
              floatLabelType: 'Always', placeholder: 'Service Request No.'
            });

          },
        })
        dropDownList.appendTo(inputEle);
        inputEle.setAttribute('name', 'SerReqId');
      } else {
        if (!this.hasAddAccess) {
          args.element.querySelector('.e-event-save ')?.setAttribute('disabled', 'true')
        }
        if (!this.hasDeleteAccess) {
          args.element.querySelector('.e-event-delete ')?.setAttribute('disabled', 'true')
        }
      }
    }

  }

  onActionBeginDist(e) {

    if (e.requestType == "eventCreate") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          x.Id = x.Id.toString();
          if (x.SerReqId != null) {
            this.serviceRequestService.getById(x.SerReqId)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  data = data.object
                  let serReqDate = new Date(data.serreqdate)
                  let SDate: Date = x.StartTime;
                  let diff = SDate.valueOf() - serReqDate.valueOf()

                  if (diff >= 0) {
                    x.StartTime = x.StartTime.toString();
                    x.EndTime = x.EndTime.toString();
                    x.EngId = x.RoomId;
                    x.isactive = true;
                    x.isdeleted = false;

                    this.EngschedulerService.save(x).pipe(first()).subscribe({
                      next: (data: any) => {
                        if (!data.result) {
                          this.scheduleObj.deleteEvent(x)
                          this.scheduleObj.refreshEvents();
                          this.notificationService.showError(data.message, "Error")
                        }
                      },
                      error: (error) => {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();
                        this.notificationService.showError(error, "Error")
                      }
                    })

                  } else {
                    this.notificationService.showError("Start Date Should Be greater than or Equal" +
                      " to Service Request Date", "Error")
                    this.scheduleObj.deleteEvent(x)
                    this.scheduleObj.refreshEvents();
                  }
                },
                error: (error: any) => {
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                  this.notificationService.showError(error, "Error")
                }
              });
          } else {
            this.notificationService.showError("Service Request Field Required", "Error")
          }

        })
      } else {
        let x = e.data
        x.Id = x.Id.toString();
        if (x.SerReqId != null) {
          this.serviceRequestService.getById(x.SerReqId)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                data = data.object;
                let serReqDate = new Date(data.serreqdate)
                let SDate: Date = x.StartTime;
                let diff = SDate.valueOf() - serReqDate.valueOf()

                if (diff >= 0) {
                  x.StartTime = x.StartTime.toString();
                  x.EndTime = x.EndTime.toString();
                  x.EngId = x.RoomId;
                  x.isactive = true;
                  x.isdeleted = false;

                  this.EngschedulerService.save(x).pipe(first()).subscribe({
                    next: (data: any) => {
                      if (!data.result) {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();
                        this.notificationService.showError(data.message, "Error")
                      }
                    },
                    error: (error) => {
                      this.scheduleObj.deleteEvent(x)
                      this.scheduleObj.refreshEvents();
                      this.notificationService.showError(error, "Error")
                    }
                  })

                } else {
                  this.notificationService.showError("Start Date Should Be greater than or Equal" +
                    " to Service Request Date", "Error")
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                }
              },
              error: (error: any) => {
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();
                this.notificationService.showError(error, "Error")
              }
            });
        } else {
          this.notificationService.showError("Service Request Field Required", "Error")
        }
      }

    } else if (e.requestType == "eventChange") {

      this.EngschedulerService.update(e.data.Id, e.data)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (!data.result) {
              this.scheduleObj.deleteEvent(e.data)
              this.scheduleObj.refreshEvents();
              this.notificationService.showError(data.message, "Error")
            }
          },
          error: (error) => {
            this.scheduleObj.deleteEvent(e.data)
            this.scheduleObj.saveEvent(e.data)
            this.scheduleObj.refreshEvents();
            this.notificationService.showError(error, "Error")
          }
        })
    } else if (e.requestType == "eventRemove") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          x.Id = x.Id.toString()
          this.EngschedulerService.delete(x.Id)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (!data.result) {
                  this.scheduleObj.deleteEvent(x)
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
      } else {
        let x = e.data;
        x.Id = x.Id.toString()
        this.EngschedulerService.delete(x.Id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (!data.result) {
                this.scheduleObj.deleteEvent(x)
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
      }
    }
  }

  onPopupOpenDist(args: PopupOpenEventArgs): void {
    args.cancel = true;
    if (args.type === "QuickInfo") {
      args.cancel = true;
    }
    if (args.type === 'EventContainer') {
      let instance: Internationalization = new Internationalization();
      let date: string = instance.formatDate((<any>args.data).date, { skeleton: 'MMMEd' });
      ((args.element.querySelector('.e-header-date')) as HTMLElement).innerText = date;
      ((args.element.querySelector('.e-header-day')) as HTMLElement).innerText = 'Event count: ' + (<any>args.data).event.length;
    } else if (args.type === 'Editor') {
      // Create required custom elements in initial time
      if (!args.element.querySelector('.custom-servicereqno')) {

        if (!this.hasUpdateAccess) {
          args.element.querySelector('.e-event-save ')?.setAttribute('disabled', 'true')
        }

        let row: HTMLElement = createElement('div', { className: 'custom-servicereqno' });
        let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', { className: 'custom-field-container mt-3' });
        let inputEle: HTMLInputElement = createElement('input', {
          className: 'e-field', attrs: { name: 'SerReqId' }
        }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);
        let list = [];
        let dropDownList: DropDownList = new DropDownList({
          dataSource: list,
          fields: { text: 'text', value: 'value' },
          value: (<{ [key: string]: Object }>(args.data)).EventType as string,
          floatLabelType: 'Always', placeholder: 'Service Request No.'
        });

        this.serviceRequestService.GetServiceRequestByConId(this.user.contactId).pipe(first()).subscribe({
          next: (data: any) => {
            if (data.object != null && data.object.length > 0) {
              data.object.forEach(x => {
                list.push({ text: x.serreqno, value: x.id })
              })
            }
            dropDownList = new DropDownList({
              dataSource: list,
              fields: { text: 'text', value: 'value' },
              value: (<{ [key: string]: Object }>(args.data)).EventType as string,
              floatLabelType: 'Always', placeholder: 'Service Request No.'
            });

          },
        })
        dropDownList.appendTo(inputEle);
        inputEle.setAttribute('name', 'SerReqId');
      } else {
        if (!this.hasAddAccess) {
          args.element.querySelector('.e-event-save ')?.setAttribute('disabled', 'true')
        }
        if (!this.hasDeleteAccess) {
          args.element.querySelector('.e-event-delete ')?.setAttribute('disabled', 'true')
        }
      }
    }

  }



  //  Dist code

  public group: GroupModel = {
    resources: ['Engineers']
  };
  public allowMultipleRoom: Boolean = false;
  public roomDataSource: Object[] = [];

}
