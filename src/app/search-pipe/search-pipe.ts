import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})

//filter the movies by search term
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchText: string) {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }

    //make lowercase
    searchText = searchText.toLocaleLowerCase();

    return items.filter((movie) => {
      return (
        movie.name.toLocaleLowerCase().includes(searchText) ||
        movie.mid.toString().toLocaleLowerCase().includes(searchText)
      );
    });
  }
}
