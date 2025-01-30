import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

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
    iconUrl: '/assets/icons/marker-icon.png', // Ruta a la imagen del marcador
    shadowUrl: 'assets/icons/marker-shadow.png', // Ruta a la sombra del marcador
    iconSize: [25, 41], // Tamaño del icono
    iconAnchor: [12, 41], // Punto donde se "ancla" el icono en el mapa
    popupAnchor: [1, -34], // Punto donde aparece el popup
    shadowSize: [41, 41] // Tamaño de la sombra
  });

  
  ngOnInit(): void {
    this.addLeafletCss();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeMap(), 0);
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private addLeafletCss(): void {
    const leafletCssId = 'leaflet-css';
    if (!document.getElementById(leafletCssId)) {
      const link = document.createElement('link');
      link.id = leafletCssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }

  private initializeMap(): void {
    if (!this.map && this.mapContainer?.nativeElement) {
      this.map = L.map(this.mapContainer.nativeElement).setView(this.initialCoordinates, this.initialZoom);

      // Añadir capa de mosaico
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Agregar evento de clic en el mapa
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateMarker(e.latlng);
        this.reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      // Crear marcador inicial
      this.marker = L.marker(this.initialCoordinates, { draggable: false }).addTo(this.map);
      //this.marker.bindPopup('Ubicación inicial').openPopup();

      // Ajustar tamaño del mapa
      setTimeout(() => this.map.invalidateSize(), 500);
    }
  }

  private updateMarker(latlng: L.LatLng): void {
    if (this.marker) {
      this.marker.setLatLng(latlng).openPopup();
    } else {
      this.marker = L.marker(latlng).addTo(this.map).openPopup();
    }
  }

  private reverseGeocode(lat: number, lon: number): void {
    fetch(`${this.geocodeUrl}&lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.address) {
          const { country, city, road } = data.address;

          // Guardar datos en el objeto
          this.locationData = {
            lat: lat,
            lon: lon,
            country: country || 'Desconocido',
            city: city || 'Desconocida',
            street: road || 'Desconocida'
          };

          // Mostrar datos en el marcador
          const locationInfo = `Country: ${this.locationData.country}, City: ${this.locationData.city}, Street: ${this.locationData.street}`;
          this.marker.bindPopup(locationInfo).openPopup();
        }
      })
      .catch(error => console.error('Error obteniendo datos de ubicación:', error));
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
  }
}
