import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { Meta } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FooterComponent, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'task-management-app';

  meta = inject(Meta);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'An Angular task management app' },
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
      {
        rel: 'canonical',
        href: 'https://task-management-app-manthanank.vercel.app/',
      },
      { property: 'og:title', content: 'Task Management App' },
      { name: 'author', content: 'Manthan Ankolekar' },
      { name: 'keywords', content: 'angular, nodejs. express, mongodb' },
      { name: 'robots', content: 'index, follow' },
      {
        property: 'og:description',
        content:
          'A simple task management app built using Angular, Node.js, Express, and MongoDB.',
      },
      {
        property: 'og:image',
        content: 'https://task-management-app-manthanank.vercel.app/image.jpg',
      },
      {
        property: 'og:url',
        content: 'https://task-management-app-manthanank.vercel.app/',
      },
    ]);
  }
}
