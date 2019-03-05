import { BackendConnector } from './../services/backendconnector.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoginStatusService } from '../services/loginstatus.service';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  getPostSubscription: Subscription;
  addFriendSubscription: Subscription;
  signinForm: FormGroup;
  isUserLoggedIn: boolean; // is user in logIn state or not 
  showLoginForm: boolean; // loginForm on Header is visible or not

  allUserdata: any;
  allFriendsRequest: any;
  usersProfilePic: any = "";

  sentRequestFoundStatus: boolean = false;
  receiveRequestFoundStatus: boolean = false;
  isProfilePicFound: boolean = false;
  isTotalRequestFound: boolean = false;

  constructor(private connectorService: BackendConnector, private loginService: LoginStatusService,
    private formBuilder: FormBuilder, private router: Router, private cookie: CookieService,
    private chatService: ChatService) {

    //Initialize formGroup with initial values and validators
    this.signinForm = this.formBuilder.group({
      EmailUsername: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

  }

  ngOnInit() {

    // If user is logged-In, then navigate it to 'home' page
    if (this.loginService.isUserLoggedIn()) {
      this.loginService.deActivateLoginForm();
      this.router.navigate(["landingpage/home"]);
    }
    else {
      // get loginForm visibilty status from LoginService
      this.showLoginForm = this.loginService.getLoginFormActivationStatus();
    }

    // keep update about loginForm visibility state
    this.loginService.loginFormStatus.subscribe(
      (loginFormStatus: boolean) => {
        this.showLoginForm = loginFormStatus;
      }
    );

    // keep update about user loggedIn state
    this.loginService.userLoginStatus.subscribe(
      (userLoginStatus: boolean) => {
        this.isUserLoggedIn = userLoginStatus;
      }
    );
   
    this.getPostSubscription = this.chatService.getPost().subscribe(
      (newpost: any) => {
        this.usersProfilePic = newpost.profilepics;
      });

    this.updateFriendList();
  }

  updateFriendList() {
    this.addFriendSubscription = this.chatService.getRequest().subscribe(
      (friendsData: any) => {
        this.allFriendsRequest = friendsData.allFriendRequests;
        this.allUserdata = friendsData.allUserdata;
      });

    this.connectorService.getFriendRequestData();
  }

  onSignIn() {   // if user SignIn

    // get user data
    const EmailorUsername = this.signinForm.value.EmailUsername;
    const password = this.signinForm.value.password;

    if (!this.signinForm.valid) {  //if form is not valid
      // -- Which signIn input fields are not valid (i.e. empty) -----
      if ((EmailorUsername == "" || EmailorUsername == null) && (password == "" || password == null)) {
        this.loginService.setSigninErrorStatus("bothInvalid");
      }
      else if (EmailorUsername == "" || EmailorUsername == null) {
        this.loginService.setSigninErrorStatus("invalidEmail");
      }
      else if (password == "" || password == null) {
        this.loginService.setSigninErrorStatus("invalidPassword");
      }
      // -------------------------------------------------------------

      // If email/username or password is not empty then store it (to show it on signIn component) 
      if (EmailorUsername != "") {
        this.loginService.setUserEmail(EmailorUsername);
      }
      if (password != "") {
        this.loginService.setUserPassword(password);
      }
      // -----------------------------------------------------------

      this.router.navigate(['/signin']); // navigate to SignIn Page
    }

    else { // --------- if form is valid ---
      this.connectorService.signInRequest({ 'emailORusername': EmailorUsername, 'password': password }).then(
        (signInStatus: any) =>  // get data receieved from backend
        {
          if (!signInStatus.status) { // if response has 'false' in it, then signIn failed
            this.loginService.setSigninErrorStatus("incorrectData"); // store error msg, to show it in signIn page
            this.loginService.setUserEmail(EmailorUsername); // store username or email
            this.loginService.setUserPassword(password);  // store password
            this.router.navigate(['/signin']);
          }
          else {
            this.loginService.activateLogin(); // update LoggedIn status
            this.loginService.deActivateLoginForm(); // deActivate loginForm in headers
            this.cookie.set("email", EmailorUsername); // store user data in cookie service
            this.cookie.set("authUserId", signInStatus.data.user_id);
            this.router.navigate(['landingpage/home']);
          }
        }
      );
    }
  }

  sendFriendRequest(receiverId: number) {
    this.connectorService.setFriendRequest(receiverId, 'sent');
  }

  acceptFriendRequest(senderId: number) {
    this.connectorService.FriendRequestUpdate(senderId, 'accept');
  }

  rejectFriendRequest(senderId: number) {
    this.connectorService.FriendRequestUpdate(senderId, 'reject');
  }

  // Show main-page (i.e. Register Component)
  LoadSignUp() {
    this.loginService.activateLoginForm();
    this.signinForm.value.email = "";
    this.signinForm.value.password = "";
    this.loginService.clearInputData();
    this.router.navigate(['/']);
  }

  // SignOut, clear cookie and navigate to main-page
  Signout() {
    this.cookie.delete("email");
    this.cookie.delete("authUserId");
    
    this.loginService.deActivateLogin();
    this.loginService.activateLoginForm();
    this.signinForm.reset();
    this.loginService.clearInputData();
    this.loginService.setSigninErrorStatus("");
    this.router.navigate(['/']);
  }

  goToRoute(nextRoute: string) {
    this.loginService.setNextRouteName(nextRoute);
  }

  // ********************* Called in ngIF in HTML *****************************************************
  sentRequestFound() {
    this.sentRequestFoundStatus = true;
  }
  sentRequestUnfound() {
    this.sentRequestFoundStatus = false;
  }

  receiveRequestFound() {
    this.receiveRequestFoundStatus = true;
  }
  receiveRequestUnfound() {
    this.receiveRequestFoundStatus = false;
  }

  profilePicFound() {
    this.isProfilePicFound = true;
  }
  profilePicNotfound() {
    this.isProfilePicFound = false;
  }

  RequestCountFound(){
    this.isTotalRequestFound = true;
  }

  RequestCountNotFound(){
    this.isTotalRequestFound = false;
  }
  // ************************************************************************************************

  ngOnDestroy() {
    this.addFriendSubscription.unsubscribe();
    this.getPostSubscription.unsubscribe();
  }
}
