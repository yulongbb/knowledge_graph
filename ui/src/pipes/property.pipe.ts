import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs';
@Pipe({ name: 'property' })
export class PropertyPipe implements PipeTransform {

  constructor(private http: HttpClient) {}

  transform(property: string): any {
    console.log(property);

    return this.http
      .get(`assets/json/ontology_property.json`)
      .pipe(map((data: any) => data.RECORDS.filter((p:any) => p.id==property.replace('P', ''))[0].name))
  }
}
