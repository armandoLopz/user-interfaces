import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
  }
  
  private initMap(): void {
    this.map = L.map('map').setView([19.4326, -99.1332], 13); // CDMX coordenadas

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([19.4326, -99.1332]).addTo(this.map)
      .bindPopup('Ciudad de México')
      .openPopup();
  }
}
