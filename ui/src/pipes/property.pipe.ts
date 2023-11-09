import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs';
@Pipe({ name: 'property' })
export class PropertyPipe implements PipeTransform {

  constructor(private http: HttpClient) {}

  transform(property: string): any {
    console.log(property);

    return this.http
      .get(`/api/properties/${property.replace('P', '')}`)
      .pipe(map((p: any) => p.name))
  }
}
