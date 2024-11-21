import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as XLSX from 'xlsx'; // Import xlsx for handling Excel files
import { saveAs } from 'file-saver';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
@Component({
  selector: 'app-open-camera',
  templateUrl: './open-camera.page.html',
  styleUrls: ['./open-camera.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ButtonModule,
    IonMenuButton,
    IonButtons,
    IonButtons,
  ],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None,
})
export class OpenCameraPage implements OnInit, OnDestroy {
  private camera1Scanner!: Html5QrcodeScanner;
  private camera2Scanner!: Html5QrcodeScanner;
  private excelFileName = 'scanned_data.xlsx'; // Define the Excel file name
  private scannedData: Array<{
    cameraNo: number;
    dateTime: string;
    qrData: string;
  }> = [];
  private lastScanTime: { [key: number]: number } = {}; // Store the last scan time for each camera
  private debounceTime = 5000; // 5 seconds debounce time

  constructor(
    private messageService: MessageService,
    private toastController: ToastController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    // Open both cameras and scan for QR codes
    this.startCamera1();
    this.startCamera2();
  }

  // Show success toast using Ionic's ToastController
  async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success', // You can customize the color as well
    });
    toast.present();
  }

  // Show warning toast for duplicate or no data scenarios
  async showWarning(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'warning', // Yellow warning toast
    });
    toast.present();
  }
  startCamera1() {
    this.camera1Scanner = new Html5QrcodeScanner(
      'camera1',
      {
        fps: 10,
        qrbox: 250,
      },
      false
    ); // verbose set to false

    this.camera1Scanner.render(
      (qrCodeMessage: string) => {
        this.handleQrCodeScan(qrCodeMessage, 1);
      },
      (errorMessage: string) => {
        console.warn(`Camera 1 error: ${errorMessage}`);
      }
    );
  }

  startCamera2() {
    this.camera2Scanner = new Html5QrcodeScanner(
      'camera2',
      {
        fps: 10,
        qrbox: 250,
      },
      false
    ); // verbose set to false

    this.camera2Scanner.render(
      (qrCodeMessage: string) => {
        this.handleQrCodeScan(qrCodeMessage, 2);
      },
      (errorMessage: string) => {
        console.warn(`Camera 2 error: ${errorMessage}`);
      }
    );
  }

  handleQrCodeScan(qrCodeMessage: string, cameraId: number): void {
    const currentTime = Date.now();

    if (
      this.lastScanTime[cameraId] &&
      currentTime - this.lastScanTime[cameraId] < this.debounceTime
    ) {
      return; // Skip scan if within debounce time
    }

    this.lastScanTime[cameraId] = currentTime;
    const currentDateTime = new Date().toLocaleString();

    const newEntry = {
      cameraNo: cameraId,
      dateTime: currentDateTime,
      qrData: qrCodeMessage,
    };

    // Check if the new QR code already exists in the scanned data (ignoring the camera)
    const isDuplicate = this.scannedData.some(
      (data) => data.qrData === newEntry.qrData
    );

    // If not a duplicate, add the new entry to the scanned data
    if (!isDuplicate) {
      this.scannedData.push(newEntry);

      // Show success toast notification
      this.showSuccess(
        `Camera ${cameraId}: ${qrCodeMessage} scanned at ${currentDateTime}`
      );

      // Insert the new entry into Supabase
      this.supabaseService
        .insertScannedData(
          newEntry.cameraNo,
          newEntry.dateTime,
          newEntry.qrData
        )
        .then(() => {
          console.log('Data inserted successfully into Supabase.');
        })
        .catch((error) => {
          console.error('Error inserting data:', error);
          this.showWarning('Failed to insert scanned data into Supabase.');
        });
    } else {
      this.showWarning('This QR code has already been scanned.');
    }
  }

  // Function to download the report as an Excel file
  downloadReport(): void {
    if (this.scannedData.length === 0) {
      this.showWarning('No data available for download');
      return;
    }

    // Prepare the worksheet with the scanned data
    const worksheet = XLSX.utils.json_to_sheet(this.scannedData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ScannedData');

    // Generate an Excel file and download it
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    // Save the Excel file with the name 'scanned_data.xlsx'
    saveAs(data, this.excelFileName);
  }

  // Function to read the existing Excel file (mock implementation, you may replace this with a real file fetch)
  getExcelFile(): any {
    // Simulate fetching an Excel file. Replace this with actual file reading logic if needed.
    throw new Error('File not found');
  }

  ngOnDestroy(): void {
    if (this.camera1Scanner) {
      this.camera1Scanner.clear();
    }
    if (this.camera2Scanner) {
      this.camera2Scanner.clear();
    }
  }
}
