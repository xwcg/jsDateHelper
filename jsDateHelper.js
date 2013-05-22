/*
    Copyright 2013 Michael Schwarz
  
    This file is part of jsDateHelper.

    jsDateHelper is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    jsDateHelper is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with jsDateHelper.  If not, see <http://www.gnu.org/licenses/>.
*/

// Flags
var FLAG_SUNDAY = 1;
var FLAG_MONDAY = 2;
var FLAG_TUESDAY = 4;
var FLAG_WEDNESDAY = 8;
var FLAG_THURSDAY = 16;
var FLAG_FRIDAY = 32;
var FLAG_SATURDAY = 64;
var FLAG_ALLDAYS = FLAG_SUNDAY | FLAG_MONDAY | FLAG_TUESDAY | FLAG_WEDNESDAY | FLAG_THURSDAY | FLAG_FRIDAY | FLAG_SATURDAY;
var FLAG_WORKDAYS = FLAG_MONDAY | FLAG_TUESDAY | FLAG_WEDNESDAY | FLAG_THURSDAY | FLAG_FRIDAY;
var FLAG_WEEKENDS = FLAG_SATURDAY | FLAG_SUNDAY;
var FLAG_ARRAY = [FLAG_SUNDAY, FLAG_MONDAY, FLAG_TUESDAY, FLAG_WEDNESDAY, FLAG_THURSDAY, FLAG_FRIDAY, FLAG_SATURDAY];

var FIRST_WEEKDAY = FLAG_MONDAY;

// Locales
var L_LOCALE_TIMEFORMAT = "12"; // 12 || 24
var L_LOCALE_TIME_AM = "AM";
var L_LOCALE_TIME_PM = "PM";

var L_TIME_PREFIX = "at";
var L_TIME_PAST = "";
var L_TIME_PAST_SUFFIX = "ago";
var L_TIME_FUTURE = "in";
var L_TIME_FUTURE_SUFFIX = "";
var L_TIME_PAST_SHORT = "just now";
var L_TIME_FUTURE_SHORT = "in a bit";
var L_TIME_PRESENT = "now";

var L_SECOND = "second";
var L_SECONDS = "seconds";
var L_MINUTE = "minute";
var L_MINUTES = "minutes";
var L_HOUR = "hour";
var L_HOURS = "hours";
var L_DAY = "day";
var L_DAYS = "days";
var L_YESTERDAY = "yesterday";
var L_TOMORROW = "tomorrow";
var L_WEEK = "week";
var L_WEEKS = "weeks";
var L_MONTH = "month";
var L_MONTHS = "months";
var L_YEAR = "year";
var L_YEARS = "years";

// Magic
// All date functions NEVER touch the original.
// Date objects are being cloned, operated on and then returned.
var date =
{
    // Sets given date (d) time to 12:00:00.00
    normalize: function (d)
    {
        var dd = new Date((d.getTime) ? d.getTime() : d);
        dd.setHours(12, 0, 0, 0);
        return dd;
    },
    // Sets given date (d) to the 1st of the Month and time to 12:00:00.00
    normalizeMonth: function (d)
    {
        var dd = date.fix(d);
        dd.setDate(1);
        dd.setHours(12, 0, 0, 0);
        return dd;
    },
    // Fixes strings, numbers and all into a date object, also handy for cloning
    fix: function (d)
    {
        try
        {
            var fixed = new Date((d.getTime) ? d.getTime() : d);
            if (!fixed.getTime || isNaN(fixed.getTime()))
                fixed = new Date(parseInt(d, 10));
            return fixed;
        }
        catch (x)
        {
            console.error("Error fixing date: ", d);
            return this.now;
        }
    },
    // Rounds time from date (d) within 5 minutes
    round: function (d)
    {
        var dd = date.fix(d);
        dd.setHours(date.get.hour(dd),
            Math.round(date.get.minute(dd) / 5) * 5,
            0, 0);
        return dd;
    },
    // Returns Date object with current date/time
    get now()
    {
        return new Date();
    },
    // Get x of date(d)
    get:
        {
            _fix: function (d)
            {
                return date.fix(d);
            },
            _leadify: function (v, lead)
            {
                if (v < 10 && !!lead)
                    return "0{0}".format(v);
                else
                    return v;
            },

            // Seconds of (d), with (leadingZero)'s if true
            second: function (d, leadingZero)
            {
                var val = this._fix(d).getSeconds();
                return this._leadify(val, leadingZero);
            },
            // Minutes of (d), with (leadingZero)'s if true
            minute: function (d, leadingZero)
            {
                var val = this._fix(d).getMinutes();
                return this._leadify(val, leadingZero);
            },
            // Hour of (d), with (leadingZero)'s if true
            hour: function (d, leadingZero, twelveHourFormat)
            {
                var val = this._fix(d).getHours();

                if (!!twelveHourFormat)
                {
                    if (val == 0)
                        val = 12;
                    else if (val >= 13)
                        val -= 12;
                }

                return this._leadify(val, leadingZero);
            },
            // Day (of month) of (d), with (leadingZero)'s if true
            day: function (d, leadingZero)
            {
                var val = this._fix(d).getDate();
                return this._leadify(val, leadingZero);
            },
            // Month (1-12) of (d), with (leadingZero)'s if true
            month: function (d, leadingZero)
            {
                var val = this._fix(d).getMonth() + 1;
                return this._leadify(val, leadingZero);
            },
            // Year Number (1970-2xxx)
            year: function (d)
            {
                var val = this._fix(d).getFullYear();
                return val;
            },
            // ISO Week (!! NOT AMERICAN WEEKS !!)
            isoWeek: function (d)
            {
                // Stolen from jQuery UI
                var b = this._fix(d);
                b.setDate(b.getDate() + 4 - (b.getDay() || 7));
                var c = b.getTime();
                return b.setMonth(0), b.setDate(1), Math.floor(Math.round((c - b) / 864e5) / 7) + 1;
            },

            // Special Methods

            // Day of the Week FLAGMASK
            dotw: function (d)
            {
                var mask = 0x0;
                var dN = this._fix(d);

                switch (dN.getDay())
                {
                    case 0:
                        mask |= FLAG_SUNDAY;
                        break;
                    case 1:
                        mask |= FLAG_MONDAY;
                        break;
                    case 2:
                        mask |= FLAG_TUESDAY;
                        break;
                    case 3:
                        mask |= FLAG_WEDNESDAY;
                        break;
                    case 4:
                        mask |= FLAG_THURSDAY;
                        break;
                    case 5:
                        mask |= FLAG_FRIDAY;
                        break;
                    case 6:
                        mask |= FLAG_SATURDAY;
                        break;
                }

                return mask;
            },
            // Day of the Week INT (1-7; 1 = Monday)
            dotwInt: function (d)
            {
                var dN = this._fix(d);

                switch (dN.getDay())
                {
                    case 0:
                        return 7;
                    default:
                        return dN.getDay();
                }
            },
            // Day of the Week FLAGMASK for DOTW INT
            dotwForInt: function (d)
            {
                var mask = 0x0;

                switch (d)
                {
                    case 0:
                        mask |= FLAG_MONDAY;
                        break;
                    case 1:
                        mask |= FLAG_TUESDAY;
                        break;
                    case 2:
                        mask |= FLAG_WEDNESDAY;
                        break;
                    case 3:
                        mask |= FLAG_THURSDAY;
                        break;
                    case 4:
                        mask |= FLAG_FRIDAY;
                        break;
                    case 5:
                        mask |= FLAG_SATURDAY;
                        break;
                    case 6:
                        mask |= FLAG_SUNDAY;
                        break;
                }

                return mask;
            },
            // All (dotw)'s in month of (d) as an array
            dotwArrFor: function (d, dotw)
            {
                if ((FLAG_ALLDAYS & dotw) <= 0)
                {
                    return null;
                }

                var fD = this._fix(d);
                var mD = this.month(fD) - 1;
                var arr = [];
                fD = new Date(this.year(fD), this.month(fD) - 1, 1);

                while (fD.getMonth() == mD)
                {
                    if (this.dotw(fD) == dotw)
                    {
                        arr.push(new Date(fD.getTime()));
                    }

                    // 864e5 === 86400000
                    fD = new Date(fD.getTime() + 864e5); //date_addDays(fD, 1);
                }

                return arr;
            },
            // Array with N'th DOTW in (d)s Month
            nthDayArr: function (d, n)
            {
                var fD = this._fix(d);
                var mD = this.month(fD) - 1;
                var arr = [];
                //new Date(year, month, day, hours, minutes, seconds, milliseconds);
                fD = new Date(this.year(fD), this.month(fD) - 1, 1);

                var arr = [];
                for (var i = 0; i < FLAG_ARRAY.length; i++)
                {
                    arr[FLAG_ARRAY[i]] = [0, null];
                }

                while (fD.getMonth() == mD)
                {
                    if (arr[this.dotw(fD)][0] < n)
                    {
                        arr[this.dotw(fD)][0]++;
                        arr[this.dotw(fD)][1] = new Date(fD.getTime());
                    }

                    var found = 0;
                    for (var i = 1; i < arr.length; i *= 2)
                    {
                        arr[i][0] == n && found++;
                    }

                    if (found >= 7)
                        break;

                    fD = new Date(fD.getTime() + 864e5); //date_addDays(fD, 1);
                }

                var outarr = [];
                for (var i = 1; i < arr.length; i *= 2)
                {
                    outarr[i] = arr[i][1];
                }
                return outarr;
            },
            // Week start day for day(d) according to FIRST_WEEKDAY
            weekStart: function (d)
            {
                var dateLook = this._fix(d);
                var dateStart = null;

                // Is this day the set start of the week?
                if (this.dotw(dateLook) & FIRST_WEEKDAY)
                {
                    dateStart = new Date(dateLook);
                }
                else // no
                {
                    var distanceBack = 0;
                    var distanceForw = 0;

                    var dateBack = null;
                    var dateForw = null;

                    // search for it
                    while (!(this.dotw(dateLook) & FIRST_WEEKDAY))
                    {
                        dateLook = date.sub.days(dateLook, 1);
                        distanceBack++;
                    }

                    dateBack = date.fix(dateLook);
                    dateLook = this._fix(d);

                    while (!(this.dotw(dateLook) & FIRST_WEEKDAY))
                    {
                        dateLook = date.add.days(dateLook, 1);
                        distanceForw++;
                    }

                    dateForw = date.fix(dateLook);

                    dateStart = distanceBack < distanceForw ? date.fix(dateBack) : date.fix(dateForw);

                    if (!date.is.sameWeek(dateStart, d))
                        dateStart = distanceBack > distanceForw ? date.fix(dateBack) : date.fix(dateForw);
                }

                return dateStart;
            },
            // First day of (month)[0-11] and (year)
            startForYearAndMonth: function (year, month)
            {
                return new Date(year, month, 1, 0, 0, 0);
            },
            // Last day of (month)[0-11] and (year)
            endForYearAndMonth: function (year, month)
            {
                var start = this.startForYearAndMonth(year, month);
                return this.endOfMonth(start);
            },
            // First day of (week) in (year)
            startForYearAndWeek: function (year, week)
            {
                var ts = new Date(year, 0, 1).getTime();
                ts += ((week - 1) * 7) * MULTIPLIER_DAYS;

                return new Date(ts);
            },
            // Last day of (week) in (year)
            endForYearAndWeek: function (year, week)
            {
                var d = date.add.days(this.startForYearAndWeek(year, week), 6);
                d.setHours(23);
                d.setMinutes(59);
                d.setSeconds(59);

                return d;
            },

            // First day of month of(d)
            startOfMonth: function (d)
            {
                var cd = this._fix(d);
                return new Date(cd.getFullYear(), cd.getMonth(), 1, 0, 0, 0);
            },
            // Last day of month of (d)
            endOfMonth: function (d)
            {
                var cd = this._fix(d);
                return new Date(cd.getFullYear(), cd.getMonth() + 1, 0, 23, 59, 59);
            },
            // Last day NUMBER of month of (d) aka. How many days does this month have?
            lastDotm: function (d)
            {
                return this.day(this.endOfMonth(d));
            },

            // Number of days between (a) and (b)
            daysBetween: function (a, b)
            {
                var dA = this._fix(a);
                var dB = this._fix(b);

                var start = (dA.getTime() < dB.getTime()) ? dA : dB;
                var end = (dA.getTime() > dB.getTime()) ? dA : dB;

                var days = Math.ceil(Math.abs((date.normalize(start).getTime() - date.normalize(end).getTime()) / MULTIPLIER_DAYS));
                return days;
            },
            // Number of weeks between (a) and (b)
            weeksBetween: function (a, b)
            {
                var dA = this._fix(a);
                var dB = this._fix(b);

                var start = (dA.getTime() < dB.getTime()) ? dA : dB;
                var end = (dA.getTime() > dB.getTime()) ? dA : dB;

                var count = 0;

                count = Math.floor(Math.abs(start - end) / (7 * MULTIPLIER_DAYS));

                return count;
            },
            // Number of months between (a) and (b)
            monthsBetween: function (a, b)
            {
                var dA = this._fix(a);
                var dB = this._fix(b);

                var start = this._fix((dA.getTime() < dB.getTime()) ? dA : dB);
                var end = this._fix((dA.getTime() > dB.getTime()) ? dA : dB);

                // Check for February safety
                // 27 will probably do. Whatever.
                if (this.day(start) > 27)
                {
                    start.setDate(26);
                }

                var count = 0;

                while ((this.month(start) !== this.month(end)) || (this.year(start) !== this.year(end)))
                {
                    count++;

                    start = date.add.months(start, 1);
                }

                return count;
            },
            // Number of years between (a) and (b)
            yearsBetween: function (a, b)
            {
                var dA = this._fix(a);
                var dB = this._fix(b);

                var start = this._fix((dA.getTime() < dB.getTime()) ? dA : dB);
                var end = this._fix((dA.getTime() > dB.getTime()) ? dA : dB);

                var count = Math.abs(date.get.year(end) - date.get.year(start));

                return count;
            },
        },
    add:
        {
            _fix: function (d)
            {
                return date.fix(d);
            },

            _multiplier:
                {
                    seconds: 1000,
                    minutes: 60,
                    hours: 60,
                    day: 24
                },

            // Add (a) seconds to (d)
            seconds: function (d, a)
            {
                var ts = this._fix(d).getTime() + (a * this._multiplier.seconds);
                return new Date(ts);
            },
            // Add (a) minutes to (d)
            minutes: function (d, a)
            {
                return this.seconds(d, a * this._multiplier.minutes);
            },
            // Add (a) hours to (d)
            hours: function (d, a)
            {
                return this.minutes(d, a * this._multiplier.hours);
            },
            // Add (a) days to (d)
            days: function (d, a)
            {
                return this.hours(d, a * this._multiplier.day);
            },
            // Add (a) months to (d)
            months: function (d, a)
            {
                var f = this._fix(d);
                return f.setMonth(f.getMonth() + a);
            },
            // Add (a) years to (d)
            years: function (d, a)
            {
                var f = this._fix(d);
                return f.setFullYear(f.getFullYear() + a);
            }
        },
    sub:
        {
            _fix: function (d)
            {
                return date.fix(d);
            },
            _multiplier:
                {
                    seconds: 1000,
                    minutes: 60,
                    hours: 60,
                    day: 24
                },

            // Substract (a) seconds from (d)
            seconds: function (d, a)
            {
                var ts = this._fix(d).getTime() - (a * this._multiplier.seconds);
                return new Date(ts);
            },
            // Substract (a) minutes from (d)
            minutes: function (d, a)
            {
                return this.seconds(d, a * this._multiplier.minutes);
            },
            // Substract (a) hours from (d)
            hours: function (d, a)
            {
                return this.minutes(d, a * this._multiplier.hours);
            },
            // Substract (a) days from (d)
            days: function (d, a)
            {
                return this.hours(d, a * this._multiplier.day);
            },
            // Substract (a) months from (d)
            months: function (d, a)
            {
                var f = this._fix(d);
                return f.setMonth(f.getMonth() - a);
            },
            // Substract (a) years from (d)
            years: function (d, a)
            {
                var f = this._fix(d);
                return f.setFullYear(f.getFullYear() - a);
            }
        },
    is:
        {
            _fix: function (d)
            {
                return date.fix(d);
            },

            // Are (a) and (b) exactly the same? (takes into account s. and ms.)
            same: function (a, b)
            {
                var aa = this._fix(a);
                var bb = this._fix(b);

                return aa === bb;
            },
            // Are (a) and (b) the same day?
            sameDay: function (a, b)
            {
                var aa = this._fix(a);
                var bb = this._fix(b);

                if (aa.getDate() == bb.getDate() &&
                    aa.getMonth() == bb.getMonth() &&
                    aa.getFullYear() == bb.getFullYear())
                    return true;

                return false;
            },
            // Are (a) and (b) the same week?
            sameWeek: function (a, b)
            {
                var aa = this._fix(a);
                var bb = this._fix(b);

                if (aa.getFullYear() == bb.getFullYear() &&
                    date.get.isoWeek(aa) == date.get.isoWeek(bb))
                {
                    return true;
                }

                return false;
            },
            // Are (a) and (b) the same month?
            sameMonth: function (a, b)
            {
                var aa = this._fix(a);
                var bb = this._fix(b);

                if (aa.getFullYear() == bb.getFullYear() &&
                    date.get.month(aa) == date.get.month(bb))
                {
                    return true;
                }

                return false;
            },
            // Is (a) before (b)?
            ABeforeB: function (a, b)
            {
                var aa = this._fix(a);
                var bb = this._fix(b);

                aa.setHours(0, 0, 0, 0);
                bb.setHours(0, 0, 0, 0);

                if (aa.getTime() < bb.getTime())
                {
                    return true;
                }

                return false;
            },
            // Is (a) after (b)?
            AAfterB: function (a, b)
            {
                var aa = this._fix(a);
                var bb = this._fix(b);

                aa.setHours(0, 0, 0, 0);
                bb.setHours(0, 0, 0, 0);

                if (aa.getTime() > bb.getTime())
                {
                    return true;
                }

                return false;
            },
            // Is (d) within (a) and (b), include (ambos)?
            Within: function (d, a, b, ambos)
            {
                var dd = this._fix(d);
                var aa = this._fix(a);
                var bb = this._fix(b);

                if (!!ambos && (this.sameDay(dd, aa) || this.sameDay(dd, bb)))
                    return true;

                if (this.ABeforeB(dd, aa) || this.AAfterB(dd, bb))
                {
                    return false;
                }

                return true;
            }
        },
    to:
        {
            _fix: function (d)
            {
                return date.fix(d);
            },
            timeString: function (d, leadingZeroHours)
            {
                var a = this._fix(d);

                if (L_LOCALE_TIMEFORMAT == "12")
                {
                    return "{0}:{1} {2}".format(date.get.hour(a, leadingZeroHours, true), date.get.minute(a, true),
                        date.get.hour(a) > 11 ? L_LOCALE_TIME_PM : L_LOCALE_TIME_AM);
                }
                else
                {
                    return "{0}:{1}".format(date.get.hour(a, leadingZeroHours), date.get.minute(a, true));
                }
            },
            // Relative localized time string, i.e. "in 10 minutes", "2 hours ago"
            relativeFormat: function (d)
            {
                if (d === null)
                    return L_TIME_PRESENT;

                var dd = this._fix(d);

                if (date.is.sameDay(dd, date.now))
                {
                    var timeDiff = Math.round((dd.getTime() - date.now.getTime()) / 1000);
                    var isPast = (timeDiff < 0);

                    // Under 5 seconds
                    if (Math.abs(timeDiff) < 5)
                    {
                        return isPast ? L_TIME_PAST_SHORT : L_TIME_FUTURE_SHORT;
                    }

                    // Under 1 minute
                    if (Math.abs(timeDiff) < 60)
                    {
                        return "{0} {1} {2} {3}".format(isPast ? L_TIME_PAST : L_TIME_FUTURE,
                            Math.abs(timeDiff),
                            L_SECONDS,
                            isPast ? L_TIME_PAST_SUFFIX : L_TIME_FUTURE_SUFFIX);
                    }

                    // Under 1 hour
                    if (Math.abs(timeDiff) < 3600)
                    {
                        timeDiff = Math.round(timeDiff / 60);
                        var multiple = (Math.abs(timeDiff) > 1);

                        return "{0} {1} {2} {3}".format(isPast ? L_TIME_PAST : L_TIME_FUTURE, Math.abs(timeDiff), multiple ? L_MINUTES : L_MINUTE,
                            isPast ? L_TIME_PAST_SUFFIX : L_TIME_FUTURE_SUFFIX);
                    }

                    // More than 1 hour
                    timeDiff = Math.round(timeDiff / 3600);
                    var multiple = (Math.abs(timeDiff) > 1);
                    return "{0} {1} {2} {3}".format(isPast ? L_TIME_PAST : L_TIME_FUTURE, Math.abs(timeDiff), multiple ? L_HOURS : L_HOUR,
                            isPast ? L_TIME_PAST_SUFFIX : L_TIME_FUTURE_SUFFIX);
                }
                else
                {
                    var dayDiff = Math.abs(Math.round((dd.getTime() - date.now.getTime()) / MULTIPLIER_DAYS));
                    var multiple = (dayDiff > 1);

                    if (date.is.AAfterB(dd, date.now))
                    {
                        if (multiple)
                        {
                            if (dayDiff >= 7 && dayDiff < 30)
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_FUTURE,
                                    Math.round(dayDiff / 7),
                                        Math.round(dayDiff / 7) > 1 ? L_WEEKS : L_WEEK,
                                    L_TIME_FUTURE_SUFFIX);
                            }
                            else if (dayDiff >= 30 && dayDiff < 365)
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_FUTURE,
                                    Math.round(dayDiff / 30.4368),
                                    Math.round(dayDiff / 30.4368) > 1 ? L_MONTHS : L_MONTH,
                                    L_TIME_FUTURE_SUFFIX);
                            }
                            else if (dayDiff >= 365)
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_FUTURE,
                                    Math.round(dayDiff / 365.242),
                                    Math.round(dayDiff / 365.242) > 1 ? L_YEARS : L_YEAR,
                                    L_TIME_FUTURE_SUFFIX);
                            }
                            else
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_FUTURE, dayDiff, L_DAYS, L_TIME_FUTURE_SUFFIX);
                            }
                        }
                        else
                            return "{0} {1} {2} {3}".format(L_TOMORROW, L_TIME_PREFIX, date.to.timeString(dd, true), L_TIME_FUTURE_SUFFIX);
                    }
                    else
                    {
                        if (multiple)
                        {
                            if (dayDiff >= 7 && dayDiff < 30)
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_PAST,
                                    Math.round(dayDiff / 7),
                                        Math.round(dayDiff / 7) > 1 ? L_WEEKS : L_WEEK,
                                    L_TIME_PAST_SUFFIX);
                            }
                            else if (dayDiff >= 30 && dayDiff < 365)
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_PAST,
                                    Math.round(dayDiff / 30.4368),
                                    Math.round(dayDiff / 30.4368) > 1 ? L_MONTHS : L_MONTH,
                                    L_TIME_PAST_SUFFIX);
                            }
                            else if (dayDiff >= 365)
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_PAST,
                                    Math.round(dayDiff / 365.242),
                                    Math.round(dayDiff / 365.242) > 1 ? L_YEARS : L_YEAR,
                                    L_TIME_PAST_SUFFIX);
                            }
                            else
                            {
                                return "{0} {1} {2} {3}".format(L_TIME_PAST, dayDiff, L_DAYS, L_TIME_PAST_SUFFIX);
                            }
                        }
                        else
                            return "{0} {1} {2} {3}".format(L_YESTERDAY, L_TIME_PREFIX, date.to.timeString(dd, true), L_TIME_PAST_SUFFIX);
                    }
                }
            }
        },
    set:
        {
            _fix: function (d)
            {
                return date.fix(d);
            },

            // Set (a) to date of (b) while keeping time of (a)
            sameDay: function (a, b)
            {
                return new Date(date.get.year(b),
                    date.get.month(b) - 1,
                    date.get.day(b),
                    date.get.hour(a),
                    date.get.minute(a),
                    date.get.second(a), 0);
            },
            // Set (d) to 00:00:00.00
            startOfDay: function (d)
            {
                var dd = this._fix(d);
                dd.setHours(0, 0, 0, 0);
                return dd;
            },
            // Set (d) to 23:59:59
            endOfDay: function (d)
            {
                var dd = this._fix(d);
                dd.setHours(23, 59, 59);
                return dd;
            }
        }
};

// http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
// C# Style String.format
// can be used with any string, for example:
// "{0} World!".format("Hello");
/**
* {function([string|number]): string}
*/
String.prototype.format = function ()
{
    var a = arguments;
    return this.replace(/{(\d+)}/g, function (c, d)
    {
        return "undefined" != typeof a[d] ? a[d] : c
    });
}