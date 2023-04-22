export class ServiceRequest {
  id: string;
  serreqno: string;
  serreqdate: string;
  distributor: string;
  assignedto: string;
  createdon: Date;
  date: string;
  visittype: string;
  companyName: string;
  requesttime: string;
  sitename: string;
  country: string;
  contactperson: string;
  email: string;
  operatorname: string;
  operatornumber: string;
  operatoremail: string;
  machmodelname: string;
  machinesNo: string;
  xraygenerator: string;
  samplehandlingtype: string;
  breakdowntype: string;
  isrecurring: boolean;
  recurringcomments: string;
  breakoccurdetailsid: string;
  alarmdetails: string;
  resolveaction: string;
  currentinstrustatus: string;
  compliantregisName: string;
  registrarphone: string;
  accepted: boolean;
  engComments: EngineerCommentList[];
  assignedHistory: tickersAssignedHistory[];
  customerName: string;
  engAction: actionList[];
  siteid: string;
  custid: string;
  distid: string;
  machengineer: string;
  serresolutiondate: string;
  requesttypeid: string;
  subrequesttypeid: string;
  machinemodelname: string;
  isCritical: boolean;
  statusid: string;
  stageid: string;
}

export class EngineerCommentList {
  id: string;
  nextdate: string;
  comments: string;
  servicerequestid: string;
  engineerid: string;
}

export class tickersAssignedHistory {
  id: string;
  engineerid: string;
  engineername: string;
  assigneddate: any;
  ticketstatus: string;
  servicerequestid: string;
  comments: string;
}

export class actionList {
  id: string;
  engineerid: string;
  engineername: string;
  actiontaken: string;
  comments: string;
  actiondate: string;
  teamviewrecording: string;
  servicerequestid: string;
}
