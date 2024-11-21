import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    if (!this.supabase) {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseKey
      );
    }
  }

  // Method to insert data into a table
  async insertData(
    tableName: string,
    data: any
  ): Promise<{ success: boolean; errorMessage?: string }> {
    const { error } = await this.supabase.from(tableName).insert(data);

    if (error) {
      console.error('Error inserting data:', error.message);

      // Handle duplicate key errors
      if (error.message.includes('duplicate key value')) {
        if (error.message.includes('profile_data_user_email_key')) {
          return {
            success: false,
            errorMessage:
              'The email is already in use. Please use a different email.',
          };
        }
        if (error.message.includes('profile_data_user_phone_key')) {
          return {
            success: false,
            errorMessage:
              'The phone number is already in use. Please use a different phone number.',
          };
        }
      }
      // Handle other errors
      return {
        success: false,
        errorMessage: 'An unexpected error occurred. Please try again later.',
      };
    }

    return { success: true };
  }

  // Method to fetch data from a table
  async fetchData(tableName: string) {
    const { data, error } = await this.supabase.from(tableName).select('*');
    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
    return data;
  }

  // Method to delete data from a table based on ID
  async deleteData(tableName: string, id: number) {
    const { error } = await this.supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.error('Error deleting data:', error.message);
      return false;
    }
    return true;
  }

  // Method to insert camera scanned data into the Supabase table
  async insertScannedData(
    cameraNo: number,
    dateTime: string,
    qrData: string
  ): Promise<void> {
    const { error } = await this.supabase.from('scanned_data').insert([
      {
        cameraNo: cameraNo,
        dateTime: dateTime,
        qrData: qrData,
      },
    ]);

    if (error) {
      console.error('Error inserting data:', error);
      throw new Error('Failed to insert scanned data.');
    }
  }
}
