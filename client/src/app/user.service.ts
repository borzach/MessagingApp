import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject, Subscription, forkJoin, from, of, race, timer } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';

import { Conversation, Message, User } from './user';
import { MessageService } from './message.service';
import { element } from 'protractor';


@Injectable({ providedIn: 'root' })
export class UserService {

  private userUrl = 'http://localhost:3000/api/users';//'api/users';  // URL to web api
  private convUrl = 'http://localhost:3000/api/conversations';
  private msgUrl = 'http://localhost:3000/api/messages';
  private loginUrl = 'http://localhost:3000/api/login';
  public notifUrl = 'http://localhost:3000/subscribe';
  readonly VAPID_KEY = 'BKMj0G8gM5d15pUytibmgaltVJ-LLy63CF9LnsR80Cq0XmmcCU5vsenDat4QiVjNXoz4w7fXUSReGz19sYxvYeY';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  loggedInUser: User = {
    _id: "",
    username: "",
    email: "",
    password: "",
    contacts:[],
    conversations: [],
    endpointNotif: null
  };
  lastUserLog!: BehaviorSubject<User>; //= new BehaviorSubject<User>(this.loggedInUser);
  isLoggedIn = false;
  contactsLoaded: User[] = [];
  openConversation: Conversation = {
    _id: "",
    members: [],
    messages: []
  };
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  postSubscription(sub: PushSubscriptionJSON) {
    return this.http.post(this.notifUrl, sub);
  }
  /** GET heroes from the server */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl)
    .pipe(
      tap(_ => this.log('fetched users')),
      catchError(this.handleError<User[]>('getUsers', []))
    );
  }

  /** GET hero by id. Return `undefined` when id not found */
  getUserNo404<Data>(id: number): Observable<User> {
    const url = `${this.userUrl}/?_id=${id}`;
    return this.http.get<User[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<User>(`getHero id=${id}`))
      );
  }

  /** GET hero by id. Will 404 if id not found */
  getUser(id: string): Observable<User> {
    const url = `${this.userUrl}/${id}`;
    return this.http.get<User>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<User>(`getHero id=${id}`))
    );
  }

  /** GET hero by id. Will 404 if id not found */
  getConv(id: string): Observable<Conversation> {
    const url = `${this.convUrl}/${id}`;
    return this.http.get<Conversation>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Conversation>(`getHero id=${id}`))
    );
  }

  /** GET hero by id. Will 404 if id not found */
  getMsg(id: string): Observable<Message> {
    const url = `${this.msgUrl}/${id}`;
    return this.http.get<Message>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Message>(`getHero id=${id}`))
    );
  }

  getAllMsgFromUser(user: User) :  Message[] {
      var allMessages: Message[] = [];
      user.conversations.forEach((convId) =>  {
        this.getConv(convId).subscribe((conv) => {
          conv.messages.forEach((message) => {
            this.getMsg(message).subscribe((msg)=> {
              allMessages.push(msg);
            });
          })
        });
      });
      return allMessages;
  }

  getAllMsgFromConv(conv: Conversation) :  Message[] {
    var allMessages: Message[] = [];

    conv.messages.forEach((message) => {
      this.getMsg(message).subscribe((msg)=> {
        allMessages.push(msg);
      });
    })
    return allMessages;
}

private usersInConvSubject = new Subject<boolean>();

onConvExist(users: User[]): Observable<boolean> {
  if (users[0].conversations.length === 0) {
    this.usersInConvSubject.next(false);
    return of(false);
  }

  const observables = users[0].conversations.map(convId => this.getConv(convId));

  return forkJoin(observables).pipe(
    map(convs => {
      let convFound = false;
      for (const conv of convs) {
        let usersInConvCount = 0;
        conv.members.forEach(member => {
          users.forEach(usr => {
            if (member.includes(usr._id)) {
              usersInConvCount++;
            }
          });
        });
        if (usersInConvCount === users.length) {
          this.usersInConvSubject.next(true);
          convFound = true;
          break; // Sortir de la boucle si la conversation est trouvée
        }
      }
      if (!convFound) {
        this.usersInConvSubject.next(false);
      }
      return convFound;
    }),
    catchError(error => {
      console.error(error);
      this.usersInConvSubject.next(false);
      return of(false);
    })
  );
}

getConvFromMembers(usr1: User, usr2: User): Observable<Conversation> {
  return new Observable<Conversation>((observer) => {
    var usr1Found = false;
    var usr2Found = false;
    var isGroupConv = false;
    usr1.conversations.forEach((convId) => {
      this.getConv(convId).subscribe((conv) => {
        usr1Found = usr2Found = isGroupConv = false;

        if (conv.members.length > 2) {
          isGroupConv = true;
        }

        conv.members.forEach(members => {
          if (members == usr1._id) {
            usr1Found = true;
          } else if (members == usr2._id) {
            usr2Found = true;
          }
        });

        if (!isGroupConv && usr1Found && usr2Found) {
          this.openConversation = conv;
          observer.next(conv);
          observer.complete();
        }
      });
    });
  });
}

  logginUser(user: User): Observable<any> {
    const username = user.username;
    const password = user.password;
    const credentials = { username, password };

    const serverRequest = this.http.post<User>(this.loginUrl, credentials).pipe(
      tap(response => {
        // Mise en cache de la réponse
        caches.open('post-cache').then(cache => {
          cache.put(this.loginUrl, new Response(JSON.stringify(response)));
        });
      })
    );

    return serverRequest.pipe(
      catchError((error) => {
        // En cas d'erreur, essayez de récupérer la réponse du cache
        return this.getCachedResponse(this.loginUrl);
      })
    );
  }

  private getCachedResponse(url: string): Observable<any> {
    return from(caches.open('post-cache')).pipe(
      switchMap(cache => from(cache.match(url))),
      switchMap(response => response ? from(response.json()) : of(null))
    );
  }

  /* GET heroes whose name contains search term */
  searchUsers(term: string): Observable<User[]> {
    if (!term.trim()) {
      // if not search term, return empty User array.
      return of([]);
    }
    return this.http.get<User[]>(`${this.userUrl}/?username=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found heroes matching "${term}"`) :
         this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<User[]>('searchHeroes', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new hero to the server */
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.userUrl, user).pipe(
      tap((newUser: User) => this.log(`added user w/ id=${newUser._id}`)),
      catchError(this.handleError<User>('addUser'))
    );
  }

    /** POST: add a new hero to the server */
  addMessage(msg: Message): Observable<Message> {
    return this.http.post<Message>(this.msgUrl, msg).pipe(
      tap((newMsg: Message) => this.log(`added Message w/ id=${newMsg._id}`)),
      catchError(this.handleError<Message>('addMessage'))
    );
  }

      /** POST: add a new hero to the server */
  addConversation(conv: Conversation): Observable<Conversation> {
    return this.http.post<Conversation>(this.convUrl, conv).pipe(
      tap((newConv: Conversation) => {
        newConv.members.forEach(mbr_Id => {
          this.getUser(mbr_Id).subscribe(usr => {
            usr.conversations.push(newConv._id);
            this.updateUser(usr);
          })
        });
      }),
      catchError(this.handleError<Conversation>('addConversation'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteUser(id: string): Observable<User> {
    const url = `${this.userUrl}/${id}`;

    return this.http.delete<User>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted user id=${id}`)),
      catchError(this.handleError<User>('deleteUser'))
    );
  }

  /** PUT: update the hero on the server */
  updateUser(usr: User) {
    const url = `${this.userUrl}/${usr._id}`;
    this.http.put<User>(url, usr).subscribe(response => {
      // Mise à jour des contacts après avoir reçu la réponse de la requête PUT
      this.loggedInUser.contacts.forEach((contact) => {
        this.getUser(contact).subscribe((user) => {
          if (!this.contactsLoaded.find((element) => element._id == user._id)) {
            this.contactsLoaded.push(user);
          }
        });
      });
    });
  }

  /** PUT: update the hero on the server */
  updateConversation(conv: Conversation){
    const url = `${this.convUrl}/${conv._id}`;
    return this.http.put<Conversation>(url, conv).subscribe(response => {
      this.openConversation = response;
    });
  }

    /** PUT: update the hero on the server */
    updateMessage(msg: Message): Observable<Message> {
      const url = `${this.msgUrl}/${msg._id}`;
      this.getConv(msg.convId).subscribe(conv => {
        conv.messages.push(msg._id);
        this.updateConversation(conv);
      });
      return this.http.put<Message>(url, msg);//.subscribe(response => console.log(response));
    }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`UserService: ${message}`);
  }
}
