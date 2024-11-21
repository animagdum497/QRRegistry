import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCol,
  IonIcon,
  IonItem,
  IonButton,

} from '@ionic/angular/standalone';
import { User } from 'src/app/models/user';
import { StorageService } from 'src/app/services/storage.service';
import { of, switchMap } from 'rxjs';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class UserPage implements OnInit {
  newUserName = 'intial value';
  userList: User[] = [];
  isWeb: any;

  constructor(private storage: StorageService) {}

  ngOnInit() {
    try {
      this.storage
        .userState()
        .pipe(
          switchMap((res) => {
            if (res) {
              return this.storage.fetchUsers();
            } else {
              return of([]); // Return an empty array when res is false
            }
          })
        )
        .subscribe((data) => {
          this.userList = data; // Update the user list when the data changes
        });
    } catch (err) {
      throw new Error(`Error: ${err}`);
    }
  }
  async createUser() {
    console.log('entered Name >> ', this.newUserName);
    alert(this.newUserName);
    await this.storage.addUser(this.newUserName);
    this.newUserName = '';
    console.log(this.userList, '#users');
  }

  updateUser(user: User) {
    const active = user.active === 0 ? 1 : 0;
    this.storage.updateUserById(user.id.toString(), active);
  }

  deleteUser(user: User) {
    this.storage.deleteUserById(user.id.toString());
  }
}


