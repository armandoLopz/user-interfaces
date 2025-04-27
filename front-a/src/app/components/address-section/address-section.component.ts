import { Component, Input, OnInit, signal } from '@angular/core';
import { addressInterface } from '../../interfaces/interfaces.models';;

@Component({
  selector: 'app-address-section',
  imports: [],
  templateUrl: './address-section.component.html',
  styleUrl: './address-section.component.css'
})
export class AddressSectionComponent  {

  @Input() mainAddress = signal<addressInterface[]>([]);
  
}
