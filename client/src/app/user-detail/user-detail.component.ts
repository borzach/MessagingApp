import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { User } from '../user';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: [ './user-detail.component.css' ]
})
export class UserDetailComponent implements OnInit {
  user: User | undefined;
  loggedInUser: User = {
    _id: '',
    username: '',
    email: '',
    password: '',
    contacts:[],
    conversations: [],
    endpointNotif: null
  };

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getHero();console.log("user");
  }

  getHero(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    /*this.userService.getUser(id.toString()).subscribe(user => {
      this.user = user;
    });*/
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.user) {
     // this.userService.updateUser(this.user).subscribe(() => this.goBack());
    }
  }
}
