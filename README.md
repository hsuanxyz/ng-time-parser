# ng-time-parser

[Live DEMO](https://stackblitz.com/edit/angular-ivy-ixbf6f)

## Use

```typescript
import { LOCALE_ID } from '@angular/core';

const parser1 = new NgTimeParser('hh:mm:ss a', localeId);
console.log(parser1.getTime('12:30:22 AM'))
console.log(parser1.getTime('12:30:22 PM'))

const parser2 = new NgTimeParser('hh:mm:ss aaaaa', localeId);
console.log(parser2.getTime('12:30:22 a'))
console.log(parser2.getTime('12:30:22 p'))

const parser3 = new NgTimeParser('H:mm(ss)', localeId);
console.log(parser3.getTime('12:30(22)'))
console.log(parser3.getTime('24:30(22)'))  

const parser4 = new NgTimeParser('mm(ss) HH', localeId);
console.log(parser4.getTime('30(22) 08'))
console.log(parser4.getTime('0(22) 23'))  
```

```typescript
interface TimeParserResult {
  hour: number | null;
  minute: number | null;
  second: number | null;
  period: number;  // 0: AM; 1: PM
}
```

## Build

TODO
