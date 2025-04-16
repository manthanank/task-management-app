import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.auth.redirectToTasks();
    }
  }
}
