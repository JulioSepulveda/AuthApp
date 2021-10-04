import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { catchError, map, tap } from "rxjs/operators";
import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseUrl;
  /* Se pone la exclamación para que no de el error por no inicializarlo */
  private _ususario!: Usuario;

  get usuario() {
    return { ...this._ususario }
  }

  constructor( private http: HttpClient ) { }

  /* LLamada HTTP al login de nuestro backend */
  login( email: string, password: string ) {

    const url = `${ this.baseUrl }/auth`;
    const body = { email, password };

    /* Servicio de respuesta
       Primero lo pasamos por el pipe tap para rellenar el usuario con el nombre y el uid 
       Después lo pasamos por el map para enviar solo el ok de la respuesta de la llamada
       Por último controlamos el error para devolverun false */
    return this.http.post<AuthResponse>( url, body )
      .pipe(
        tap( resp => {
          if ( resp.ok ) {
            /* Guardamos el token en el localStorage para poder mantener la información al recargar */
            localStorage.setItem('token', resp.token!);
          }
        }),


        map( resp => resp.ok ),
        catchError( err => of(err.error.msg) )
      );
  }

  registro ( name: string, email: string, password: string ) {

    const url = `${ this.baseUrl }/auth/new`;
    const body = { name, email, password };

    return this.http.post<AuthResponse>( url, body )
      .pipe(
        tap( ({ ok, token }) => {
          if ( ok ) {
            /* Guardamos el token en el localStorage para poder mantener la información al recargar */
            localStorage.setItem('token', token!);
          }
        }),
        map( resp => resp.ok ),
        catchError( err => of(err.error.msg) )
      );

  }

  /* Metodo para validar el token cuando se recargue el navegador */
  validarToken(): Observable<boolean> {
    const url = `${ this.baseUrl }/auth/renew`;
    /* Constante con el atributo que hay que hay que meter en la url */
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    /* Devolvemos la llamada pasandolo por un pipe y map para que devuelva un boolean*/
    return this.http.get<AuthResponse>( url, { headers } )
      .pipe(
        map( resp => {

          /* Volvemos a guardar el token ya que se genera uno nuevo cada vez que se revalida. */
          localStorage.setItem('token', resp.token!);

          /* Con esto conseguimos que la información se mantenga persistente cuando se recarga la página */
          this._ususario = { 
            name: resp.name!, 
            uid: resp.uid!,
            email: resp.email!
          } 

          return resp.ok;
        }),
        catchError( err => of(false))
      );
  }

  logout() {
    /* Borramos los token del localStorage */
    localStorage.clear();
  }
}
