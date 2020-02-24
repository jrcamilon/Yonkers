import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public apiConnectionStatus = new Subject<any>();
  public comparissonTable = new Subject<any>();

  constructor(private _http: Http) { }

  public heartbeat(): Observable<any> {
    return this._http.get('http://localhost:3094/heartbeat')
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getAllTrafficCams(streetArry: any[]): Observable<any> {

    const body = {street_list: streetArry };
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://localhost:3094/traffic', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getAllTrafficCamsByID(_id_array: any[]): Observable<any> {
    const body = {site_id_list: _id_array };
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://localhost:3094/allcamsbyid', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getPaymentsForCam(_siteId: any): Observable<any> {
    const body = {site_id: _siteId };
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://localhost:3094/payments', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getComparissonTable(_id_array: any): Observable<any> {
    // console.log(_id_array);
    const body = {site_id_list: _id_array };
    // console.log(body);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://localhost:3094/compare', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getViewDetailsRevenue(_id_array: any): Observable<any> {
    // console.log(_id_array);
    const body = {site_id_list: _id_array };
    // console.log(body);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://localhost:3094/viewdetails/revenue', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }


}
