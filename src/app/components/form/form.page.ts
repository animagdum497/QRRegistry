import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
})
export class FormPage implements OnInit {
  userForm: FormGroup;
  userList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Initialize the form with controls
    this.userForm = this.fb.group({
      user_email: ['', Validators.required],
      user_name: ['', Validators.required],
      user_phone: ['', Validators.required],
      user_city: [''],
      is_active: [true, Validators.required],
    });
    // Fetch data on initialization
    this.fetchData();
  }

  async fetchData() {
    const data = await this.supabaseService.fetchData('profile_data');
    if (data) {
      this.userList = data; // Store the fetched data in a variable
      console.log('Table_data', this.userList);
    }
  }

  async onSubmit() {
    if (this.userForm && this.userForm.valid) {
      const { user_email, user_name, user_phone, user_city, is_active } =
        this.userForm.value;
      try {
        const response = await this.supabaseService.insertData('profile_data', {
          user_email,
          user_name,
          user_phone,
          user_city,
          is_active,
        });

        if (response.success) {
          console.log('Data saved successfully');
          alert('Data saved successfully.');
          this.fetchData();
          this.userForm.reset();
        } else {
          // Show specific error message
          alert(response.errorMessage);
        }
      } catch (error) {
        console.error('Error saving data:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  }

  async deleteRecord(id: number) {
    try {
      const success = await this.supabaseService.deleteData('profile_data', id);
      if (success) {
        console.log('Data deleted successfully');
        alert('Data deleted successfully.');
        this.fetchData(); // Fetch updated data after deletion
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }
}
