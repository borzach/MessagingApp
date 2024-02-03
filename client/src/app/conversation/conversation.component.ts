import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation, User, Message } from '../user';
import { UserService } from '../user.service';
import { Form, FormsModule } from '@angular/forms';
import { Observable, Subject, forkJoin, interval, startWith, switchMap } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { CheckForUpdateService } from '../check-for-updates.service';


@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css'
})
export class ConversationComponent implements OnInit, OnChanges {
    @Input() members!: User[];
    logedInUser!: User;
    conversation!: Conversation;
    messages: Message[] = [];
    currentWorkingMsg!: Message;
    ngModel: any;
    typingString: string = "";
    membersStrArray: string[] = [];
    private membersChangeSubject = new Subject<boolean>();
    
  constructor(private userService: UserService) { 

  }
  ngOnChanges(changes: SimpleChanges): void {
      
      this.onMembersChange();
  }

  getCurrentDateTimeString(): string {
    const currentDate = new Date();
  
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0, donc on ajoute 1
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  
    const dateString = `${day}/${month}/${year} ${hours}:${minutes}`;
  
    return dateString;
  }

  onMembersChange(): void {
    this.membersStrArray = [];
    this.members.forEach(m => {
      this.membersStrArray.push(m._id);
    })
    this.logedInUser = this.userService.loggedInUser;
    if (this.members.length == 2) {
      this.userService.onConvExist(this.members).subscribe(exist => {
        if (exist) {
          this.userService.getConvFromMembers(this.members[0], this.members[1]).subscribe(conv => {
            this.messages = [];
            if (this.conversation) {
              if (this.conversation != conv) {
                this.membersChangeSubject.next(true);
              } else {
                this.membersChangeSubject.next(false);
              }
            }
            this.conversation = conv;
            this.conversation.messages.forEach(msgID => {
              this.userService.getMsg(msgID).subscribe((msg)=> {
                this.messages.push(msg);
              });
            });
          });
        } else {
          console.log(this.membersStrArray);
          this.conversation = {
            _id: '',
            members: this.membersStrArray,
            messages: []
          }
          this.userService.addConversation(this.conversation).subscribe(conv => {
            console.log(conv);
            this.members.forEach(mb => {
              if (!mb.conversations) {
                mb.conversations = [conv._id];
              } else {
                mb.conversations.push(conv._id);
              }
              this.userService.updateUser(mb);
            });
            
            this.updateConv(conv);
          });
        }
      });
    }
  }

  localUpdateMessage() {
    this.conversation.messages.forEach(msgID => {
      this.userService.getMsg(msgID).subscribe((msg)=> {
        this.messages.push(msg);
      });
    });
  }

  getMembersChangeObservable() {
    return this.membersChangeSubject.asObservable();
  }

  ngOnInit(): void {

  }

  updateConv(conv: Conversation) {
    this.messages = [];
    this.conversation = conv;
    this.conversation.messages.forEach(msgID => {
      this.userService.getMsg(msgID).subscribe((msg)=> {
        this.messages.push(msg);
      });
    });
  }

  initMessage() {
    this.userService.addMessage(<Message>{
      _id: '',
      content: '',
      senderID: this.logedInUser._id,
      date: this.getCurrentDateTimeString(),
      convId: this.conversation._id
    }).subscribe(msg => {
      this.currentWorkingMsg = msg;
      this.userService.getConv(msg.convId).subscribe(conv => {
        conv.messages = conv.messages.filter(element => element !== "");
        conv.messages.push(msg._id);
        this.userService.updateConversation(conv);
      });
    });
  }

  sendWorkingMsg(): void {
    this.userService.addMessage(<Message>{
      _id: '',
      content: '',
      senderID: this.logedInUser._id,
      date: this.getCurrentDateTimeString(),
      convId: this.conversation._id
    }).subscribe(msg => {
      this.currentWorkingMsg = msg;
      this.currentWorkingMsg.content = this.typingString;
      this.userService.getConv(msg.convId).subscribe(conv => {
        conv.messages = conv.messages.filter(element => element !== "");
        if (conv.messages.find(msgId => msgId.includes(msg._id)) != msg._id) {
          this.userService.updateMessage(this.currentWorkingMsg).subscribe(msg => {
            this.conversation.messages.push(msg._id);
            this.messages = this.userService.getAllMsgFromConv(this.conversation);
            this.typingString = "";
          });  
        }
        if (this.members.length == 2 && this.members[1].endpointNotif) {
            console.log("postSub ", this.members[1].endpointNotif);
            this.userService.postSubscription(this.members[1].endpointNotif);
        }
      });
    });
    
  }

  handleKeyPressed(event: { key: string; }) {
    if (event.key === 'Enter') {
      this.sendWorkingMsg();
    }
  }
}
