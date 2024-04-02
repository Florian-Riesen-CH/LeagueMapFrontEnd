import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  getData(summonerName: string, historicalNb: string): Observable<any> {
    return this.http.get('https://leaguemap.onrender.com/getDatas?sumonnerName=' + summonerName + '&nbgame=' + historicalNb).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      // Vous pouvez traiter l'erreur 404 ici
      console.error('Not found error (404):', error.error);
    } else {
      // Gestion des autres erreurs HTTP
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Retourne un Observable avec une erreur utilisateur-friendly
    return throwError('Something bad happened; please try again later.');
  }
}