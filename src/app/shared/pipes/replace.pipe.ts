import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
  standalone: true
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacement: string): string {
    if (!value) return '';
    return value.replace(new RegExp(strToReplace, 'g'), replacement);
  }
}
