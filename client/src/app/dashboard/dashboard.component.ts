import { Component, OnInit } from '@angular/core';
import { Conversation, Message, User } from '../user';
import { UserService } from '../user.service';

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
    conversations: []
  };
  loadedConvs: Conversation[] = [];
  loadedMsgs: Message[] = [];
  loginState = 0;
  users: User[] = [];
  contacts: User[] = [];
  contactsToChatWith: User[] = [];
  openConversation = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
    if(this.userService.lastUserLog) {
      console.log("test")
      var usr = this.userService.lastUserLog.value;
      if (usr && usr._id) {
        this.loggedInUser = usr;
        this.userService.loggedInUser = this.loggedInUser;
        this.userService.isLoggedIn = true;
      }
    }
  }

  onLogin(): void {
    //this.userService.updateUser(this.userService.loggedInUser);
    this.contacts = this.userService.contactsLoaded;
    this.contactsToChatWith.push(this.userService.loggedInUser);

    //this.loadedMsgs = this.userService.getAllMsgFromUser(this.userService.loggedInUser);
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
    console.log(this.contactsToChatWith);
   /* this.userService.onConvExist(this.contactsToChatWith).subscribe(exist => {
      if (exist) {

      } else {
        this.contactsToChatWith.forEach(contact => {
          contact.
        })
      }
    });*/
    this.openConversation = true;
  }

  getLogedInUser() : User {
    return this.userService.loggedInUser;
  }

  isLoggedIn(): boolean {
    if (this.userService.isLoggedIn) {
      if (this.loginState == 0) {
        //this.userService.updateUser(this.userService.loggedInUser);
        //this.contacts = this.userService.contactsLoaded;
        //this.contactsToChatWith.push(this.userService.loggedInUser);
        //this.loadedMsgs = this.userService.getAllMsgFromUser(this.userService.loggedInUser);
        this.onLogin()
        this.loginState++;
      }
      this.loggedInUser = this.userService.loggedInUser;
      return true;
    }
    return false;
  }
}
