import { ChatService } from './chat.service';
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';
import { SessionStorageService } from 'angular-web-storage';

@Injectable()
export class BackendConnector {
    //http://127.0.0.1:8000/api/signup
    //http://192.168.100.7:8000/api/signup

    responseStatus: any;
    quickLike = new Subject<any>();

    constructor(private http: HttpClient, private session: SessionStorageService, private chatService: ChatService) { }

    // Connect and Send Registration Data to laravel-Backend function
    signUpRequest(signupData: any) {
        var promise = new Promise((resolve, reject) => {
            return this.http.post("http://localhost:8000/api/signup", signupData).subscribe(
                (response: any) => {
                    this.responseStatus = response;
                    resolve(this.responseStatus);
                }
            );
        });
        return promise;
    }

    // Connect and Sends SignIn Data to laravel-Backend function
    signInRequest(signinData: any) {
        var promise = new Promise((resolve, reject) => {
            return this.http.post("http://localhost:8000/api/signin", signinData).subscribe(
                (response: any) => {
                    this.responseStatus = response;
                    resolve(this.responseStatus);
                }
            );
        });
        return promise;
    }

    public uploadPost(imageFile: File, description: string) {
        const fd = new FormData();
        const id = this.session.get('authUserId');
        var desc = "";

        if (description == "" || description == null)
            desc = "";
        else
            desc = description;

        fd.append('userId', id);

        if (imageFile != null)
            fd.append('image', imageFile, imageFile.name);
        else
            fd.append('image', imageFile, "");

        fd.append('description', desc);

        return this.http.post("http://localhost:8000/api/uploadpost", fd).subscribe(
            (response: any) => {
                this.chatService.sendPost(response);
            }
        );
    }

    public uploadProfilePic(imageFile: File) {
        const userid = this.session.get('authUserId');
        const fd = new FormData();

        fd.append('userId', userid);

        if (imageFile != null)
            fd.append('profilePic', imageFile, imageFile.name);
        else
            fd.append('profilePic', imageFile, "");

        return this.http.post("http://localhost:8000/api/profilepic", fd).subscribe(
            (response: any) => {
                this.chatService.sendPost(response);
            }
        );
    }

    public getPost() {
        return this.http.post("http://localhost:8000/api/retrievepost", { 'userId': this.session.get('authUserId') }).subscribe(
            (response: any) => {
                this.chatService.sendPost(response);
            }
        );
    }

    // ********* LIKES - dISLIKES ***************************************************************
    public setLike(isLiked: boolean, isDisliked: boolean, postId: number) {
        const postLikeData = { 'userId': this.session.get('authUserId'), 'postId': postId, 'isLiked': isLiked, 'isDisliked': isDisliked }

        return this.http.post("http://localhost:8000/api/postlike", postLikeData).subscribe(
            (response: any) => {
                this.chatService.sendPost(response);
            }
        );
    }

    public setComment(postId: number, comment: string) {
        const commentData = { 'userId': this.session.get('authUserId'), 'postId': postId, 'comment': comment }

        return this.http.post("http://localhost:8000/api/comment", commentData).subscribe(
            (response: any) => {
                this.chatService.sendPost(response);
            }
        );
    }

    public setReply(postId: number, commentId: number, commentReply: string) {
        const replyData = { 'userId': this.session.get('authUserId'), 'postId': postId, 'commentId': commentId, 'commentReply': commentReply }

        return this.http.post("http://localhost:8000/api/reply", replyData).subscribe(
            (response: any) => {
                this.chatService.sendPost(response);
            }
        );
    }

    public setFriendRequest(receiverId: number, requestStatus: string) {
        const friendRequestData = { 'userId': this.session.get('authUserId'), 'receiverId': receiverId, 'requestStatus': requestStatus }

        return this.http.post("http://localhost:8000/api/setfriendrequest", friendRequestData).subscribe(
            (response: any) => {
                this.chatService.sendFriendRequest(response);
            }
        );
    }

    public FriendRequestUpdate(senderId: number, requestStatus: string) {
        const friendRequestData = { 'userId': this.session.get('authUserId'), 'senderId': senderId, 'requestStatus': requestStatus }
        return this.http.post("http://localhost:8000/api/friendrequestStatus", friendRequestData).subscribe(
            (response: any) => {
                this.chatService.sendFriendRequest(response);
            }
        );
    }

    public UnFriendRequest(friendUserId: number, requestStatus: string) {
        console.log(friendUserId);
        const unfriendRequestData = { 'userId': this.session.get('authUserId'), 'friendUserId': friendUserId, 'requestStatus': requestStatus }
        return this.http.post("http://localhost:8000/api/unfriendrequestStatus", unfriendRequestData).subscribe(
            (response: any) => {
                this.chatService.sendFriendRequest(response);
            }
        );
    }

    public getFriendRequestData() {
        const friendRequestData = { 'userId': this.session.get('authUserId') };

        return this.http.post("http://localhost:8000/api/getAddFriendData", friendRequestData).subscribe(
            (response: any) => {
                this.chatService.sendFriendRequest(response);
            }
        );
    }

    public setCurrentLike(currentPostLike: any) {
        this.quickLike.next(currentPostLike);
    }
}