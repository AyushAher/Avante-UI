export class Amc {
  id: string;
  isactive: boolean | string;
  billtoid: string;
  servicequote: string;
  sqdate: string;
  sdate: string;
  edate: string;
  project: string;
  servicetype: string;
  brand: string;
  currency: string;
  zerorate: number;
  tnc: string;
  paymentTerms: any;
  firstVisitDateFrom: string;
  secondVisitDateFrom: string;
  firstVisitDateTo: string;
  secondVisitDateTo: string;
  secondVisitDate: string;
  firstVisitDate: string;
  period: string;
}

export class instrumentList {
  instrumentId: string;
  part: string;
  partdesc: string;
  qty: string;
  rate: string;
  amount: string;
}
