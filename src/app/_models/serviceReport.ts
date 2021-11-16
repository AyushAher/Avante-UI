export class ServiceReport {
  id: string;
  customer: string;
  srOf: string;
  department: string;
  country: string;
  town: string;
  instrument: string;
  respInstrument: string;
  labChief: string;
  computerarlsn: string;
  software: string;
  brandName: string;
  firmaware: string;
  installation: boolean;
  analyticalassit: boolean;
  prevmaintenance: boolean;
  corrmaintenance: boolean;
  problem: string;
  workCompletedstr: string;
  workfinishedstr: string;
  interruptedstr: string;
  workCompleted: boolean;
  workfinished: boolean;
  interrupted: boolean;
  reason: string;
  nextvisitscheduled: string;
  engineercomments: string;
  signengname: string;
  engsignature: string;
  signcustname: string;
  custsignature: string;
  createdOn: string;
  rework: boolean;
  serviceRequestId: string;
  departmentName: string;
}

export class workDone {
  id: string;
  workdone: string;
  servicereportid: string;
}

export class workTime {
  id: string;
  worktimedate: string;
  starttime: string;
  endtime: string;
  perdayhrs: string;
  totalhrs: string;
  totaldays: string;
  servicereportid: string;
}

export class sparePartsConsume {
  id:string
  sparepartId: string;
  servicereportid: string;
  hsccode: string;
  partno: string;
  configvalue: string;
  configtype: string;
  qtyconsumed: string;
}

export class sparePartRecomanded {
  sparepartId: string;
  servicereportid: string;
  hsccode: string;
  qtyrecommended: number;
  partno: string;
  configvalue: string;
  configtype: string;
  id: string;
}

export class custSPInventory {
  hSCCode: string;
  qtyAvailable: number;
  partNo: string;
  configValue: string;
  configType: string;
  customerId: string;
  customerName: string;
  id: string;
}
