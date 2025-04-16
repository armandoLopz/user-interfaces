import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultimediaPageComponent } from './multimedia-page.component';

describe('MultimediaPageComponent', () => {
  let component: MultimediaPageComponent;
  let fixture: ComponentFixture<MultimediaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultimediaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultimediaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
