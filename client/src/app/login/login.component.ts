import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { User } from '../user';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  users: User[] = [];
  isNewUser = false;
  loggedInUser: User = {
    _id: '',
    username: '',
    email: '',
    password: '',
    contacts:[],
    conversations: []
  };
  logginMessage!: string;
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers()
    .subscribe(users => this.users = users);
  }

  createAccount(username: string, password: string, email: string): void {
    username = username.trim();
    this.loggedInUser.email = email;
    this.loggedInUser.password = password;
    this.loggedInUser.username = username;
    
    if (!username) { return; }
    this.userService.addUser(this.loggedInUser)
      .subscribe(user => {
        this.users.push(user);
        this.userService.loggedInUser = user;
        this.login();
      });
    
  }

  accesAccount(username: string, password: string) {
    this.loggedInUser.username = username;
    this.loggedInUser.password = password;
    this.userService.logginUser(this.loggedInUser).subscribe(
      (response) => {
        // Gère la réponse du serveur après la connexion
        console.log('Réponse du serveur après la connexion:', response);
        this.userService.loggedInUser = response.user;
        this.login();
      },
      (error) => {
        // Gère les erreurs éventuelles
        console.error('Erreur lors de la connexion:', error);
      }
    );
  }
  login() {
    this.userService.isLoggedIn = true;
  }
}
