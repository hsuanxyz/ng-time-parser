import { FormStyle, getLocaleDayPeriods, TranslationWidth } from '@angular/common';

export interface TimeParserResult {
  hour: number;
  minute: number;
  second: number;
  period: number;
}

export class NgTimeParser {
  regex: RegExp = null!;
  matchMap = {
    hour: -1,
    minute: -1,
    second: -1,
    periodNarrow: -1,
    periodWide: -1,
    periodAbbreviated: -1
  };
  constructor(private format: string, private localeId: string) {
    this.genRegexp();
  }

  getTime(str: string): TimeParserResult | null {
    const match = this.regex.exec(str);
    let period: number = -1;
    if (match) {
      if (this.matchMap.periodNarrow !== -1) {
        period = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Narrow).indexOf(match[this.matchMap.periodNarrow + 1])
      }
      if (this.matchMap.periodWide !== -1) {
        period = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Wide).indexOf(match[this.matchMap.periodWide + 1])
      }
      if (this.matchMap.periodAbbreviated !== -1) {
        period = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Abbreviated).indexOf(match[this.matchMap.periodAbbreviated + 1])
      }
      return {
        hour: Number.parseInt(match[this.matchMap.hour + 1], 10),
        minute: Number.parseInt(match[this.matchMap.minute + 1], 10),
        second: Number.parseInt(match[this.matchMap.second + 1], 10),
        period
      }
    } else {
      return null;
    }
  }

  genRegexp(): void {
    let regexStr = this.format.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$&');
    const hourRegex = /h{1,2}/i;
    const minuteRegex = /m{1,2}/;
    const secondRegex = /s{1,2}/;
    const periodNarrow = /aaaaa/;
    const periodWide = /aaaa/;
    const periodAbbreviated = /a{1,3}/;

    const hourMatch = hourRegex.exec(this.format);
    const minuteMatch = minuteRegex.exec(this.format);
    const secondMatch = secondRegex.exec(this.format);
    const periodNarrowMatch = periodNarrow.exec(this.format);
    let periodWideMatch: null | RegExpExecArray = null;
    let periodAbbreviatedMatch: null | RegExpExecArray = null;
    if (!periodNarrowMatch) {
      periodWideMatch = periodWide.exec(this.format);
    }
    if (!periodWideMatch && !periodNarrowMatch) {
      periodAbbreviatedMatch = periodAbbreviated.exec(this.format);
    }

    const matchs = [hourMatch, minuteMatch, secondMatch, periodNarrowMatch, periodWideMatch, periodAbbreviatedMatch]
      .filter(m => !!m)
      .sort((a, b) => a!.index - b!.index);

    matchs.forEach((match, index) => {
      switch (match) {
        case hourMatch:
          this.matchMap.hour = index;
          regexStr = regexStr.replace(hourRegex, '(\\d{1,2})');
          break;
        case minuteMatch:
          this.matchMap.minute = index;
          regexStr = regexStr.replace(minuteRegex, '(\\d{1,2})');
          break;
        case secondMatch:
          this.matchMap.second = index;
          regexStr = regexStr.replace(secondRegex, '(\\d{1,2})');
          break;
        case periodNarrowMatch:

          this.matchMap.periodNarrow = index;
          const periodsNarrow = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Narrow).join('|');
          regexStr = regexStr.replace(periodNarrow, `(${periodsNarrow})`);
          break;
        case periodWideMatch:
          this.matchMap.periodWide = index;
          const periodsWide = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Wide).join('|');
          regexStr = regexStr.replace(periodWide, `(${periodsWide})`);
          break;
        case periodAbbreviatedMatch:
          this.matchMap.periodAbbreviated = index;
          const periodsAbbreviated = getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Abbreviated).join('|');
          regexStr = regexStr.replace(periodAbbreviated, `(${periodsAbbreviated})`);
          break;
      }
    });

    this.regex = new RegExp(regexStr);
  }
}
