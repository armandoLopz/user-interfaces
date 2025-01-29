import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  private map!: L.Map;

  // Coordenadas y zoom inicial
  private initialCoordinates: L.LatLngExpression = [51.505, -0.09];
  private initialZoom = 13;

  ngOnInit(): void {
    this.addLeafletCss(); // Añadir CSS dinámicamente
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private addLeafletCss(): void {
    // Añadir CSS de Leaflet dinámicamente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }

  private initializeMap(): void {
    if (!this.map && this.mapContainer) {
      // Crear mapa
      this.map = L.map(this.mapContainer.nativeElement).setView(
        this.initialCoordinates,
        this.initialZoom
      );

      // Añadir capa de mosaicos
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Añadir marcador
      L.marker(this.initialCoordinates)
        .addTo(this.map)
        .openPopup();

      // Forzar actualización del tamaño
      setTimeout(() => this.map.invalidateSize(), 0);
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
  }
}