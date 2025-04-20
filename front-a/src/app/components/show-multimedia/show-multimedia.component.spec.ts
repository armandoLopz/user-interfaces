import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMultimediaComponent } from './show-multimedia.component';

describe('ShowMultimediaComponent', () => {
  let component: ShowMultimediaComponent;
  let fixture: ComponentFixture<ShowMultimediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMultimediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowMultimediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
