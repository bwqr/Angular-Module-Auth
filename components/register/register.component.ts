import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { catchError, tap, map } from 'rxjs/operators';

import { HelpersService, CacheService } from '../../imports';
import { AuthRequestService } from '../../services/auth-request.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {

  constructor(
    private authRequestService: AuthRequestService,
    private helpersService: HelpersService
  ) { }

  error = false;

  errorText: string;

  ngOnInit() {
  }

  register(f: NgForm) {
    let rq2 = this.authRequestService.register({
      name: f.value.name,
      email: f.value.email,
      password: f.value.password,
      password_confirmation: f.value.password_confirmation
    })
      .pipe(
        map(response => this.helpersService.parseToken(response)),
        tap(response => {
          localStorage.setItem('token', response.token);
          this.helpersService.navigate(['/']);
        }),
        catchError(error => this.registerErrorHandle(error))
      )
      .subscribe(response => {
        rq2.unsubscribe();
        rq2 = null;
      });
  }

  private registerErrorHandle(error: any): Promise<any> {
    const jsError = error.error;

    switch (error.status) {
      case 422:
        this.error = true;

        for (const one of Object.keys(jsError)) {

          this.errorText = jsError[one][0];
          break;
        }
        break;
    }

    return Promise.reject(error);
  }
}
