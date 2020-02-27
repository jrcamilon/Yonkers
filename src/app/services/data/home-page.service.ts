import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';

import 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class HomePageService {

  public filtersInUse = new Subject<any>();

  constructor(private _http: Http) { }

  public getAllStats(): Observable<any> {
    // const body = {street_list: streetArry };
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.get('http://10.2.71.205:3094/statistics', {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getAllyearsFilters(): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.get('http://10.2.71.205:3094/statistics/yearfilters', {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public getAllStatsFiltered(yearsArray: any[], monthsArray: any[]): Observable<any> {
    const body = {years_filter: yearsArray, months_filter: monthsArray};
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://10.2.71.205:3094/statistics/statsFiltered', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }



}
