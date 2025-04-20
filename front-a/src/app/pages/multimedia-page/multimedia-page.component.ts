import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { ImagesComponent } from '../../components/images/images.component';
import { VideosComponent } from '../../components/videos/videos.component';

@Component({
  selector: 'app-multimedia-page',
  standalone: true,
  imports: [SideBarComponent, VideosComponent, CommonModule, ReactiveFormsModule, ImagesComponent],
  templateUrl: './multimedia-page.component.html',
  styleUrls: ['./multimedia-page.component.css']
})
export class MultimediaPageComponent {

}