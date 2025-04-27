import { Component, Input, OnInit, signal } from '@angular/core';
import { addressInterface } from '../../interfaces/interfaces.models';
import { AddressService } from '../../services/address/address.service';

@Component({
  selector: 'app-address-section',
  imports: [],
  templateUrl: './address-section.component.html',
  styleUrl: './address-section.component.css'
})
export class AddressSectionComponent implements OnInit {

  @Input() mainAddress = signal<addressInterface[]>([]);

  constructor(
    private addressService: AddressService
  ) { }

  ngOnInit(): void {

    /* if (this.userId) {

      this.addressService.getDataAddressByUserId(this.userId)
        .subscribe({
          next: (addresses: addressInterface[]) => {
            this.mainAddress.update((currentAddresses) => [...currentAddresses, ...addresses]);
          },
          error: (error) => {
            console.error("Error al obtener las direcciones:", error);
            this.mainAddress.set([]);
          }
        });
        
    }else{

      console.error("user id is null")
    }*/

  }

}
