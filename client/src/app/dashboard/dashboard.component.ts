import { Component, OnInit } from '@angular/core';
import { Conversation, Message, User } from '../user';
import { UserService } from '../user.service';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { CheckForUpdateService } from '../check-for-updates.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  loggedInUser: User = {
    _id: "",
    username: "",
    email: "",
    password: "",
    contacts:[],
    conversations: [],
    endpointNotif: null,
  };
  loadedConvs: Conversation[] = [];
  loadedMsgs: Message[] = [];
  loginState = 0;
  users: User[] = [];
  contacts: User[] = [];
  contactsToChatWith: User[] = [];
  openConversation = false;

  constructor(private userService: UserService, private swPush: SwPush, private checkForUpdateService: CheckForUpdateService,private swUpdate: SwUpdate) {
    
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.checkForUpdateService.versionReady$.subscribe(() => {
        if (confirm('New version available! would you like to update?')) {
          window.location.reload();
        }
      });
    }
    this.getUsers();
    if(this.userService.lastUserLog) {
      var usr = this.userService.lastUserLog.value;
      if (usr && usr._id) {
        this.loggedInUser = usr;
        this.userService.loggedInUser = this.loggedInUser;
        this.userService.isLoggedIn = true;
      }
    }
  }

  onLogin(): void {
    this.contacts = this.userService.contactsLoaded;
    this.contactsToChatWith.push(this.userService.loggedInUser);
  }

  subcribeToNotif(): void {
    
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.userService.VAPID_KEY
      })
      .then(sub => {
        console.log("sub: ", sub);
        this.loggedInUser.endpointNotif = sub.toJSON();
        this.userService.updateUser(this.loggedInUser);
      })
      .catch(console.error);
    }
  }

  getUsers(): void {
    this.userService.getUsers()
      .subscribe(users => this.users = users);
      
  }
  addContactToLoggedIn(usr: User): void {
    this.loggedInUser.contacts.push(usr._id);
    usr.contacts.push(this.loggedInUser._id);
    this.userService.updateUser(usr);
  }
  chatWithUser(user: User) {
    const temp = this.contactsToChatWith[0];
    this.contactsToChatWith = [];
    this.contactsToChatWith.push(temp);
    this.contactsToChatWith.push(user);
    this.openConversation = true;
  }

  getLogedInUser() : User {
    return this.userService.loggedInUser;
  }

  isLoggedIn(): boolean {
    if (this.userService.isLoggedIn) {
      if (this.loginState == 0) {
        this.onLogin()
        this.loginState++;
      }
      this.loggedInUser = this.userService.loggedInUser;
      return true;
    }
    return false;
  }
}
