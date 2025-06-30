// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [
    `
      :host {
        display: block;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
    `,
  ],
})
export class AppComponent {}
