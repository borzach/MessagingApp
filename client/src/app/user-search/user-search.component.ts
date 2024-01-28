import { Component, Input, OnInit, Output } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { User } from '../user';
import { UserService } from '../user.service';
import { EventEmitter } from '@angular/core';
import { element } from 'protractor';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: [ './user-search.component.css' ]
})
export class UserSearchComponent implements OnInit {
  @Output() addContact = new EventEmitter<User>();
  users$!: Observable<User[]>;
  userToDisplay: User = {
    _id: '',
    username: '',
    email: '',
    password: '',
    contacts:[],
    conversations: []
  };
  displayUser = false;
  private searchTerms = new Subject<string>();

  constructor(private userService: UserService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.users$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      distinctUntilChanged(),

      switchMap((term: string) => this.userService.searchUsers(term)),
    );
  }
  addToContact(usr: User): void {
    if (!this.userService.loggedInUser.contacts.find((element) => element == this.userToDisplay._id)) {
       // this.userService.loggedInUser.contacts.push(this.userToDisplay._id);
        this.addContact.emit(usr);
        this.userService.updateUser(this.userService.loggedInUser);
    }
  }
  displayProfil(user: User): void {
    this.userToDisplay = user;
    this.displayUser = true;
  }
}
