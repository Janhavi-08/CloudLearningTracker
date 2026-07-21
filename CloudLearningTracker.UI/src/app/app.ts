import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { LoaderService } from './core/services/loader.service';
import { SidebarNavComponent } from './shared/sidebar-nav/sidebar-nav.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, SidebarNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showShell = false;
  isLoading$: Observable<boolean>;
  isSidebarOpen = false;
  username = 'Learner';
  today = new Date();

  constructor(private router: Router, private authService: AuthService, private loader: LoaderService) {
    this.isLoading$ = this.loader.isLoading$;
  }

  ngOnInit(): void {
    this.syncShellState(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.syncShellState(event.urlAfterRedirects));
  }

  openSidebar(): void {
    this.isSidebarOpen = true;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.isSidebarOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private syncShellState(url: string): void {
    const normalizedUrl = url.split('?')[0];
    this.showShell = !['/login', '/signup'].includes(normalizedUrl);
    this.isSidebarOpen = false;

    if (this.showShell) {
      this.username = this.authService.getCurrentUsername();
    }
  }
}
