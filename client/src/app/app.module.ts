import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UsersComponent } from './users/users.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { MessagesComponent } from './messages/messages.component';
import { LoginComponent } from "./login/login.component";
import { ConversationComponent } from "./conversation/conversation.component";

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        UsersComponent,
        UserDetailComponent,
        MessagesComponent,
        UserSearchComponent,
        LoginComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ConversationComponent
    ]
})
export class AppModule { }
