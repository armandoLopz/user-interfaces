/*
  map.component.ts
  Integración de Leaflet Control Geocoder para búsqueda de ubicaciones
*/
import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder'; // Importa el plugin de geocodificación
import { addressInterface } from '../../../interfaces/interfaces.models';

interface LocationData {
  lat: number;
  lon: number;
  country: string;
  city: string;
  street: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  private map!: L.Map;
  private marker!: L.Marker;
  private geocodeUrl = 'https://nominatim.openstreetmap.org/reverse?format=json';

  @Output() addressSelected: EventEmitter<addressInterface> = new EventEmitter();

  // Datos de la ubicación
  locationData: LocationData = {
    lat: 0,
    lon: 0,
    country: '',
    city: '',
    street: ''
  };

  // Coordenadas y zoom inicial
  private initialCoordinates: L.LatLngExpression = [51.505, -0.09];
  private initialZoom = 13;

  private customIcon = L.icon({
    iconUrl: '/assets/icons/marker-icon.png',
    shadowUrl: 'assets/icons/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngOnInit(): void {
    this.addLeafletCss();
    this.addGeocoderCss();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeMap(), 0);
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private addLeafletCss(): void {
    const id = 'leaflet-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }

  private addGeocoderCss(): void {
    const id = 'geocoder-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css';
      document.head.appendChild(link);
    }
  }

  private initializeMap(): void {
    if (!this.map && this.mapContainer?.nativeElement) {
      // Inicializar mapa
      this.map = L.map(this.mapContainer.nativeElement)
        .setView(this.initialCoordinates, this.initialZoom);

      // Capa base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Agregar control de búsqueda (geocoder)
      const geocoderControl = (L.Control as any)
        .geocoder({ defaultMarkGeocode: false })
        .addTo(this.map);

      geocoderControl.on('markgeocode', (e: any) => {
        const latlng: L.LatLng = e.geocode.center;
        // Ajustar vista
        this.map.fitBounds(e.geocode.bbox);
        // Actualizar marcador y datos
        this.updateMarker(latlng);
        this.reverseGeocode(latlng.lat, latlng.lng);
      });

      // Evento de clic para actualizar manualmente
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateMarker(e.latlng);
        this.reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      // Crear marcador inicial
      this.marker = L.marker(this.initialCoordinates, { icon: this.customIcon }).addTo(this.map);

      // Ajustar tamaño al renderizar
      setTimeout(() => this.map.invalidateSize(), 500);
    }
  }

  private updateMarker(latlng: L.LatLng): void {
    if (this.marker) {
      this.marker.setLatLng(latlng).openPopup();
    } else {
      this.marker = L.marker(latlng, { icon: this.customIcon }).addTo(this.map).openPopup();
    }
  }

  private reverseGeocode(lat: number, lon: number): void {
    fetch(`${this.geocodeUrl}&lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.address) {
          const { country, city, road } = data.address;
          this.locationData = {
            lat,
            lon,
            country: country || 'Desconocido',
            city: city || 'Desconocida',
            street: road || 'Desconocida'
          };

          const info = `Country: ${this.locationData.country}, City: ${this.locationData.city}, Street: ${this.locationData.street}`;
          this.marker.bindPopup(info).openPopup();

          // Emitir al padre
          const address: addressInterface = {
            country: this.locationData.country,
            city: this.locationData.city,
            street: this.locationData.street
          };
          this.addressSelected.emit(address);
        }
      })
      .catch(err => console.error('Error en reverse geocode:', err));
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
  }
}