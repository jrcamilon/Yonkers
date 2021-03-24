import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import * as _ from 'lodash';

import 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

//   public filtersInUse = new Subject<any>();

  constructor(private _http: Http) { }

  public getAllPosts(): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.get('http://localhost:3094/comments/all', {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

  public postReply(postId: Number,timestamp: string, author: string, reply: string): Observable<any> {
 
    const body = {
        id: postId,
        timestamp: timestamp,
        author: author,
        reply: reply
    };

    console.log(body)
    
    const headers = new Headers({'Content-Type': 'application/json'});
    return this._http.post('http://localhost:3094/comments/reply', body, {headers: headers})
    .map((response: Response) => {
      const tmpData = response.json();
      return tmpData;
    });
  }

}
