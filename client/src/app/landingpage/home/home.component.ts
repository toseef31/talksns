import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { LoginStatusService } from '../../services/loginstatus.service';
import { BackendConnector } from '../../services/backendconnector.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { SessionStorageService } from 'angular-web-storage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {

  postSubscription: Subscription;
  getPostSubscription: Subscription;

  postingFormGroup: FormGroup;

  createpost: any;
  previousPosts= [];
  maxPostsId = 0;
  userActionStatus: string = '';

  createlike: any;
  createcomments: any;
  createreplies: any;
  usernames: any;
  profilePics: any;
  loggedInUserProfilePic: any = "";
  allFriendsRequest: any = "";

  isPostLiked: boolean = false;
  isPostdisLiked: boolean = false;
  isProfileFound: boolean = false;
  isPostFound: boolean = false;
  anyPostShowd
 
  userId: number = 0;
  imageSrc: string = "";
  commentValue: string = '';
  replyValue: string = '';
  currentReplyId: number = 0;
  previousReplyId: number = 0;
  showPost: boolean = false;
  commentReplyStatus: boolean = false;
  replyCommentStatus: boolean = false;
  selectedUploadFile: File = null;

  constructor(private route: Router, private loginService: LoginStatusService, public session: SessionStorageService,
    private backendService: BackendConnector, private formbuilder: FormBuilder, private chatService: SocketService) {
    }

  ngOnInit() {
    this.userId = parseInt(this.session.get('authUserId'));
    localStorage.setItem('routerUrl', '/landingpage/home');

    this.postingFormGroup = this.formbuilder.group({
      'desc': [''],
    });

    this.getPostSubscription = this.chatService.getPost().subscribe(
      (newpost: any) => { 
        if (this.userActionStatus == 'loadmore' && newpost.currentUser_Id == this.session.get('authUserId')){
          this.createpost = this.previousPosts.concat(newpost.posts.data);
          this.previousPosts = this.previousPosts.concat(newpost.posts.data);
        }
        else{ 
          //*********** recheck needed */
          
          if (newpost.currentUser_Id == this.session.get('authUserId')){
            this.createpost = newpost.posts.data;
            this.previousPosts = newpost.posts.data;
          }
        }

        this.createlike = newpost.postlikes;
        this.createcomments = newpost.comments;
        this.usernames = newpost.usernames;
        this.createreplies = newpost.replies;
        this.profilePics = newpost.profilepics;
        this.loggedInUserProfilePic = newpost.loggedInUserProfilepic;
        this.allFriendsRequest = newpost.allFriendRequest;
      });

    this.postSubscription = this.backendService.quickLike.subscribe(
      (postLikeData: any) => {
  
        for (var i = 0; i < this.createlike.length; i++) {
          if (this.createlike[i].user_id == this.session.get('authUserId') && postLikeData.postId == this.createlike[i].post_id) {

            for (var j = 0; j < this.createpost.length; j++) {

              if (this.createpost[j].post_id == postLikeData.postId) {

                if ((!this.createlike[i].likes && !this.createlike[i].dislikes) && (postLikeData.LikedStatus && !postLikeData.dislikedStatus)) {
                  this.createpost[j].totalLiked += 1; break;
                }
                else if ((!this.createlike[i].likes && !this.createlike[i].dislikes) && (!postLikeData.LikedStatus && postLikeData.dislikedStatus)) {
                  this.createpost[j].totaldisLiked += 1; break;
                }
                //********* */
                else if ((this.createlike[i].likes && !this.createlike[i].dislikes) && (!postLikeData.LikedStatus && !postLikeData.dislikedStatus)) {
                  this.createpost[j].totalLiked -= 1;
                  if (this.createpost[j].totalLiked <= 0)
                    this.createpost[j].totalLiked = 0;
                  break;
                }
                else if ((this.createlike[i].likes && !this.createlike[i].dislikes) && (postLikeData.LikedStatus && !postLikeData.dislikedStatus)) {
                  this.createpost[j].totalLiked -= 1;
                  if (this.createpost[j].totalLiked <= 0)
                    this.createpost[j].totalLiked = 0;
                  break;
                }
                else if ((this.createlike[i].likes && !this.createlike[i].dislikes) && (!postLikeData.LikedStatus && postLikeData.dislikedStatus)) {
                  this.createpost[j].totalLiked -= 1;
                  this.createpost[j].totaldisLiked += 1;
                  if (this.createpost[j].totalLiked <= 0)
                    this.createpost[j].totalLiked = 0;
                  break;
                }
                //********* */
                else if ((!this.createlike[i].likes && this.createlike[i].dislikes) && (!postLikeData.LikedStatus && !postLikeData.dislikedStatus)) {
                  this.createpost[j].totaldisLiked -= 1;
                  if (this.createpost[j].totaldisLiked <= 0)
                    this.createpost[j].totaldisLiked = 0;
                  break;
                }
                else if ((!this.createlike[i].likes && this.createlike[i].dislikes) && (!postLikeData.LikedStatus && postLikeData.dislikedStatus)) {
                  this.createpost[j].totaldisLiked -= 1;
                  if (this.createpost[j].totaldisLiked <= 0)
                    this.createpost[j].totaldisLiked = 0;
                  break;
                }
                else if ((!this.createlike[i].likes && this.createlike[i].dislikes) && (postLikeData.LikedStatus && !postLikeData.dislikedStatus)) {
                  this.createpost[j].totalLiked += 1;
                  this.createpost[j].totaldisLiked -= 1;
                  if (this.createpost[j].totaldisLiked <= 0)
                    this.createpost[j].totaldisLiked = 0;
                  break;
                }
              }
            }

            this.createlike[i].likes = postLikeData.LikedStatus;
            this.createlike[i].dislikes = postLikeData.dislikedStatus;

            break;
          }
        }
      });

      this.backendService.getMaxPostId().then(
        (maxPostId: any)=>{
          this.maxPostsId = maxPostId + 1;
          this.backendService.getPost(this.maxPostsId);
        }
      );
     
  } // *** OnInit Ends *************

  public addMyPost(desc: string) {
    this.userActionStatus = '';
    this.backendService.uploadPost(this.selectedUploadFile, desc, this.previousPosts.length);
    this.imageSrc = "";
    this.selectedUploadFile = null;
    this.postingFormGroup.reset();
  }

  onImageUpload(event) {
    this.userActionStatus = '';
    this.selectedUploadFile = <File>event.target.files[0];

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.imageSrc = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onPostLike(postId: number, isLiked: number) {
    this.userActionStatus = '';
    this.isPostLiked = !(isLiked);
    this.backendService.setCurrentLike({ 'postId': postId, 'LikedStatus': this.isPostLiked, 'dislikedStatus': false });
    this.backendService.setLike(this.isPostLiked, false, postId, this.previousPosts.length);
  }

  onPostdisLike(postId: number, isDisliked: number) {
    this.userActionStatus = '';
    this.isPostdisLiked = !(isDisliked);
    this.backendService.setCurrentLike({ 'postId': postId, 'dislikedStatus': this.isPostdisLiked, 'likedStatus': false });
    this.backendService.setLike(false, this.isPostdisLiked, postId, this.previousPosts.length);
  }

  resetShow() {
    this.showPost = false;
  }
  check() {
    this.showPost = true;
  }

  MainComment(event, postId: number, textArea: HTMLInputElement) {
    this.userActionStatus = '';
    if (event.keyCode == 13) {
      this.backendService.setComment(postId, textArea.value, this.previousPosts.length);
      this.commentValue = "";
      this.commentReplyStatus = false;
      this.replyCommentStatus = false;
      textArea.placeholder = "Post your comment";
    }
  }

  ReplyComment(event, postId: number, commentId: number, textArea: HTMLInputElement) {
    this.userActionStatus = '';
    if (event.keyCode == 13) {
      this.backendService.setReply(postId, commentId, textArea.value, this.previousPosts.length);
      this.replyValue = "";
      this.replyCommentStatus = false;
      this.commentReplyStatus = false;
      textArea.placeholder = "Post your comment";
    }
  }

  showCommentReply(commentId: number) {
    this.userActionStatus = '';
    this.replyValue = "";
    this.commentReplyStatus = !this.commentReplyStatus;

    if (this.commentReplyStatus)
      this.replyCommentStatus = false;

    if (this.previousReplyId == commentId) {
      this.currentReplyId = this.previousReplyId;
    }
    else {
      this.currentReplyId = commentId;
      this.previousReplyId = this.currentReplyId;

      if (!this.commentReplyStatus) {
        this.commentReplyStatus = true;
      }
    }
  }

  showReplyComment(userId: string, replyId: number) {
    this.userActionStatus = '';
    for (var name of this.usernames) {
      if (name.user_id == userId)
        this.replyValue = "@" + name.username;
    }

    this.replyCommentStatus = !this.replyCommentStatus;

    if (this.replyCommentStatus)
      this.commentReplyStatus = false;

    if (this.previousReplyId == replyId) {
      this.currentReplyId = this.previousReplyId;
    }
    else {
      this.currentReplyId = replyId;
      this.previousReplyId = this.currentReplyId;

      if (!this.replyCommentStatus) {
        this.replyCommentStatus = true;
      }
    }
  }

  LoadMorePost(maxPostId: number){
    this.userActionStatus = 'loadmore';
    this.backendService.getPost(maxPostId);
  }

  ProfilePicFound() {
    this.isProfileFound = true;
  }
  ProfilePicNotFound() {
    this.isProfileFound = false;
  }

  friendsPostFound(){
    this.isPostFound = true;
  }

  friendsPostNotFound(){
    this.isPostFound = false;
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.loginService.getNextRouteName() != "")
      return true;
    if (!this.loginService.getuserLogedinStatus())
      return true;
    else {
      this.route.navigate(['landingpage/home']);
      return false;
    }
  }

  ngOnDestroy(){
    this.postSubscription.unsubscribe();
    this.getPostSubscription.unsubscribe();
  }
}