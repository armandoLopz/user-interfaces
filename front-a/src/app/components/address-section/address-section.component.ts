/*
  address-section.component.ts
*/
import { CommonModule } from '@angular/common';
import { Component, Input, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MapComponent } from '../map/map/map.component';
import { addressInterface } from '../../interfaces/interfaces.models';
import { AddressService } from '../../services/address/address.service';
import { getUserIdFromToken } from '../../utils/getToken';

@Component({
  selector: 'app-address-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent],
  templateUrl: './address-section.component.html',
  styleUrls: ['./address-section.component.css']
})
export class AddressSectionComponent implements OnInit {
  @Input() mainAddress = signal<addressInterface[]>([]);

  // Form visibility and mode
  showForm = signal(false);
  editMode = signal(false);

  // Reactive form for add/edit
  addressForm!: FormGroup;

  // Currently editing address id
  private editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.addressForm = this.fb.group({
      country: [''],
      city: [''],
      street: ['']
    });
  }

  onAddClick() {
    this.addressForm.reset();
    this.editingId = null;
    this.editMode.set(false);
    this.showForm.set(true);
  }

  onMapSelect(addr: addressInterface) {
    this.addressForm.patchValue(addr);
  }

  onSubmit() {
    const value = this.addressForm.value as addressInterface;
    const userId: number | null = getUserIdFromToken();

    if (typeof userId === 'number') {
      value.user = [userId];
    }

    if (this.editMode()) {
      if (!window.confirm('Are you sure you want to save changes to this address?')) {
        return;
      }
      const updated: any = { ...value, id: this.editingId };
      this.addressService.updateAddressData(updated).subscribe(res => {
        // Update only the modified record
        this.mainAddress.update(list => list.map(a => a.id === res.id ? res : a));
        this.showForm.set(false);
        window.alert('Address updated successfully.');
      });
    } else {
      this.addressService.postAddressData(value).subscribe(res => {
        // Add without overwriting previous
        this.mainAddress.update(list => [...list, res]);
        this.showForm.set(false);
        window.alert('Address added successfully.');
      });
    }
  }

  onEdit(address: addressInterface) {
   
    this.addressForm.patchValue(address);
    this.editingId = address.id!;
    this.editMode.set(true);
    this.showForm.set(true);
  }

  onDelete(address: addressInterface) {
    if (!address.id) return;
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    this.addressService.deleteAddressData(address.id).subscribe(() => {
      // Remove without resetting entire list
      this.mainAddress.update(list => list.filter(a => a.id !== address.id));
      window.alert('Address deleted successfully.');
    });
  }

  trackById(_index: number, item: addressInterface) {
    return item.id;
  }
}
