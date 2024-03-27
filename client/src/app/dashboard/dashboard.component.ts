import { Component, HostListener, OnInit } from '@angular/core';
import { Conversation, Message, User } from '../user';
import { UserService } from '../user.service';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { CheckForUpdateService } from '../check-for-updates.service';
import { Observable, forkJoin, map, switchMap } from 'rxjs';

interface previewConv {
  _idConv: string,
  _title: string,
  _lastMessage: string,
  _date: string
}

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
  previewConvs: previewConv[] = [];
  loadedConvs: Conversation[] = [];
  loadedMsgs: Message[] = [];
  loginState = 0;
  users: User[] = [];
  contacts: User[] = [];
  contactsToChatWith: User[] = [];
  openConversation = false;
  isSmallScreen: boolean =  window.innerWidth <= 600;
  isUserSearch = false;
  openContactSS: boolean = false;
  currentWidth: number = window.innerWidth;

  constructor(private userService: UserService, private swPush: SwPush, private checkForUpdateService: CheckForUpdateService,private swUpdate: SwUpdate) {
    
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isSmallScreen = window.innerWidth <= 600; // Ajustez la valeur selon vos besoins
    this.currentWidth = window.innerWidth;
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
    this.userService.loggedInUser.conversations.forEach(convId => {
      this.getUserFromConv(convId).subscribe(user => {
        console.log(user);
      })
    });
    
  }

  subcribeToNotif(): void {
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.userService.VAPID_KEY
      })
      .then(sub => {
        console.log("sub: ", sub);
        this.userService.postSubscription(sub);
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
  getUserFromConv(convId: string): Observable<User> {
    return new Observable<User>((observer) => { 
      this.userService.getConv(convId).subscribe(conv => {
        console.log("conv found")
        conv.members.forEach(member => {
          if (member != this.loggedInUser._id) {
            this.userService.getUser(member).subscribe(user => {
              console.log("name" + user.username)
              var prev: previewConv = {
                _idConv : convId,
                _title: user.username,
                _lastMessage: "",
                _date: ""
              }
              if (!conv.messages.length) {
                console.log("awé?")
                this.previewConvs.push(prev)
                observer.next(user);
                observer.complete();
              } else {
                console.log("msgId " + conv.messages[conv.messages.length - 1]);
                this.userService.getMsg(conv.messages[conv.messages.length - 1]).subscribe(msg => {
                  console.log("msg found");
                  prev._lastMessage = msg.content;
                  prev._date = msg.date;
                  this.previewConvs.push(prev)
                  observer.next(user);
                  observer.complete();
                });
              }
              
            });
          }
        });
      });
    });
  }
/*
  getUserFromConv(convId: string) {
    this.userService.getConv(convId).subscribe(conv => {
        conv.members.forEach(member => {
        if (member != this.loggedInUser._id) {
          this.userService.getUser(member).subscribe(user => {
            return user;
          });
        }
      });
    });
   
    
  }*/
  openConv(convId: string) {
    this.openConversation = false;
    this.userService.getConv(convId).subscribe((conv) => {
      const temp = this.contactsToChatWith[0];
      this.contactsToChatWith = [];
      this.contactsToChatWith.push(temp);
      conv.members.forEach(member => {
         this.userService.getUser(member).subscribe(user => {
          if (user._id != temp._id && !this.openConversation) {
            this.contactsToChatWith.push(user);
            this.openConversation = true;
          }
         });
      });
      
    });   
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
