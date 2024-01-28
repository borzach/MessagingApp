import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {of} from 'rxjs';

import {HeroSearchComponent} from '../user-search/user-search.component';
import {HeroService} from '../user.service';
import {HEROES} from '../mock-heroes';

import {DashboardComponent} from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let heroService;
  let getUsersSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    heroService = jasmine.createSpyObj('HeroService', ['getUsers']);
    getUsersSpy = heroService.getUsers.and.returnValue(of(HEROES));
    TestBed
        .configureTestingModule({
          declarations: [DashboardComponent, HeroSearchComponent],
          imports: [RouterModule.forRoot([])],
          providers: [
            {provide: HeroService, useValue: heroService},
          ]
        })
        .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Top Heroes" as headline', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toEqual('Top Heroes');
  });

  it('should call heroService', waitForAsync(() => {
       expect(getUsersSpy.calls.any()).toBe(true);
     }));

  it('should display 4 links', waitForAsync(() => {
       expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
     }));
});
