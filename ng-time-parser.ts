import { FormStyle, getLocaleDayPeriods, TranslationWidth } from '@angular/common';

export interface TimeParserResult {
  hour: number | null;
  minute: number | null;
  second: number  | null;
  period: 0 | 1 | null;
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
    this.regex.lastIndex = 0;
    const match = this.regex.exec(str);
    let period: 0 | 1 | null = null;
    if (match) {
      if (this.matchMap.periodNarrow !== -1) {
        period = this.getNarrowDayPeriods().indexOf(match[this.matchMap.periodNarrow + 1]) as 0 | 1
      }
      if (this.matchMap.periodWide !== -1) {
        period = this.getWideDayPeriods().indexOf(match[this.matchMap.periodWide + 1]) as 0 | 1
      }
      if (this.matchMap.periodAbbreviated !== -1) {
        period = this.getAbbreviatedDayPeriods().indexOf(match[this.matchMap.periodAbbreviated + 1]) as 0 | 1
      }
      return {
        hour:  match[this.matchMap.hour + 1] ? Number.parseInt(match[this.matchMap.hour + 1], 10) : null,
        minute: match[this.matchMap.minute + 1] ? Number.parseInt(match[this.matchMap.minute + 1], 10) : null,
        second: match[this.matchMap.second + 1] ? Number.parseInt(match[this.matchMap.second + 1], 10) : null,
        period
      }
    } else {
      return null;
    }
  }

  private genRegexp(): void {
    let regexStr = this.format.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$&');
    const hourRegex = /h{1,2}/i;        // h, hh, H, HH
    const minuteRegex = /m{1,2}/;       // m, mm
    const secondRegex = /s{1,2}/;       // s, ss
    const periodNarrow = /aaaaa/;       // aaaaa
    const periodWide = /aaaa/;          // aaaa
    const periodAbbreviated = /a{1,3}/; // a, aa, aaa

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

    /**
     * @examples
     * HH:mm:ss => (\d{1,2}):(\d{1,2}):(\d{1,2})
     * HH:mm a => (\d{1,2}):(\d{1,2}) (AM|MP)
     * HH:mm aaaaa => (\d{1,2}):(\d{1,2}) (a|p)
     */
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
          const periodsNarrow = this.getNarrowDayPeriods().join('|');
          regexStr = regexStr.replace(periodNarrow, `(${periodsNarrow})`);
          break;
        case periodWideMatch:
          this.matchMap.periodWide = index;
          const periodsWide = this.getWideDayPeriods().join('|');
          regexStr = regexStr.replace(periodWide, `(${periodsWide})`);
          break;
        case periodAbbreviatedMatch:
          this.matchMap.periodAbbreviated = index;
          const periodsAbbreviated = this.getAbbreviatedDayPeriods().join('|');
          regexStr = regexStr.replace(periodAbbreviated, `(${periodsAbbreviated})`);
          break;
      }
    });

    this.regex = new RegExp(regexStr);
  }

  private getAbbreviatedDayPeriods(): [string, string] {
    return getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Abbreviated);
  }

  private getWideDayPeriods(): [string, string] {
    return getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Wide);
  }

  private getNarrowDayPeriods(): [string, string] {
    return getLocaleDayPeriods(this.localeId, FormStyle.Format, TranslationWidth.Narrow);
  }
}
