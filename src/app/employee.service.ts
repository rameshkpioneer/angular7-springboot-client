import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, scan, shareReplay, publishReplay, refCount, tap, takeUntil, } from 'rxjs/operators';
import { CacheRegistrationService } from "./cache-registration.service";


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private baseUrl = '/employees';


  
  constructor(private cacheRegistrationService: CacheRegistrationService ,private http: HttpClient) { 

    cacheRegistrationService.addToCache(this.baseUrl);
  }

  getEmployee(id: number): Observable<Object> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createEmployee(employee: Object): Observable<Object> {
    return this.http.post(`${this.baseUrl}`, employee);
  }

  updateEmployee(id: number, value: any): Observable<Object> {
    return this.http.put(`${this.baseUrl}/${id}`, value);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getEmployeesList(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }
}