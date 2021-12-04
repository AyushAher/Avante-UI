export class travelDetails {
  id: string;
  engineername: string;
  servicerequestid: string;
  distId: string;
  triptype: string;
  fromcity: string;
  tocity: string;
  departuredate: string;
  returndate: string;
  travelclass: string;
  isactive: boolean;
  flightdetails: FlightDetails;
}

export class FlightDetails {

  id:string;
  isactive:string;

  airline : string;
  requesttype:string;

  flightno:string;
  flightcost:string;
  flightdate:string;
  currencyId:string;

}
