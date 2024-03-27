import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css'
})
export class MainMenuComponent {

    constructor(private userService: UserService) {

    }
}
