import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HPageComponent } from './h-page.component';

describe('HPageComponent', () => {
  let component: HPageComponent;
  let fixture: ComponentFixture<HPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
