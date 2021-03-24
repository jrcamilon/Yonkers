import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {TimelineService} from "../../../../services/data/timeline.service";
import * as _ from 'lodash'
import { AuthService } from '../../../../services/security/auth.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  @ViewChild('myComment') myComment: ElementRef;

  // public isCommentsExpanded = false;
  public userName: string = '';
  timelineActivityPosts: any[];
  isVisibleArr: any[];

  constructor(public commentsService: TimelineService, public auth: AuthService) { 

    this.auth.userCalims$.subscribe(userClaims => {
			if (userClaims !== undefined) {
        // console.log(userClaims.name)
        this.userName = userClaims.name;
			}
    });
    
    this.getAllPosts();
  
  }

  getAllPosts() {
    this.commentsService.getAllPosts().subscribe(res => {
      // console.log(res);
      const grouped = _.groupBy(res, x => x.id);
      const data = Object.keys(grouped).map(key => {
          let postObj = {}
          let groupedArr = grouped[key];
          const comments = groupedArr.map((post, i) => {
              if (i === 0) {
                postObj['id'] = post.id;
                postObj['author'] = post.author;
                postObj['post'] = post.post;
                postObj['time'] = new Date(post.timestamp)
              }
              if (post.replyAuthor !== null && post.reply !== null , post.replyTimestamp !== null) {
                return {
                  author: post.replyAuthor,
                  post: post.reply,
                  time: new Date(post.replyTimestamp)
                }
              } else {
                return null;
              }
          }).filter(el => el !== null);
          postObj['comments'] = comments;
          return postObj;
      });
      console.log('HERE', data)
      this.isVisibleArr = data.map(ele => {
        return false
      });
      console.log('HERE', this.isVisibleArr)
      this.timelineActivityPosts = data;
    })
  }
//   onCommentSubmit(e: any, id: number) {
  onCommentSubmit(value, id) {
    // console.log('SUBMITTED', value);
    // console.log('id:', id);
    // console.log('reply:', value);
    // console.log('author', this.userName);

    this.commentsService.postReply(
      id, 
      new Date().toISOString(), 
      this.userName, 
      value
    ).subscribe(res => {
      console.log(res);
      this.getAllPosts();
      this.isVisibleArr[0] = true;
    })
  }

  onCommentClick(e: any, id: number) {
    console.log('LIKED');
    console.log('id:', id)
  }

  ngOnInit() {
  }

}
