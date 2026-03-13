import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCompleted',
  standalone: true
})
export class FilterCompletedPipe implements PipeTransform {
  transform(items: any[] | null | undefined): any[] {
    if (!items) return [];
    return items.filter(item => item.completed);
  }
}
