export const formatDate = (date: Date): string => {
    if (!date) {
        date = new Date();
    }
    const month = date.getMonth() + 1;
    let sMonth = month.toString();
    if (month < 10) {
        sMonth = '0' + month;
    }
    const day = date.getDate();
    let sDay = day.toString();
    if (day < 10) {
        sDay = '0' + day;
    }
    return date.getFullYear() + '-' + sMonth + '-' + sDay;
}

export const formatDisplayDate = (date: Date): string => {
    if (!date) {
        return '';
    }
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

export const getDayOfWeek = (date: Date): string => {
    const DAY_OF_WEEKS = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = date.getDay();
    return DAY_OF_WEEKS[dayOfWeek];
}

export enum AMPM {
    AM,
    PM
}

export const getKabukaKey = (datetime: Date, ampm: AMPM) => {
    return formatDate(datetime) + '_' + (ampm == AMPM.AM ? 'AM' : 'PM');
}

export const getWeekFirstDay = (offsetDays: number): Date | null => {
    let date = addDate(new Date(), offsetDays);
    for (let i = 0; i < 7; i++) {
        if (date.getDay() == 0) {
            return date;
        }
        date = addDate(date, -1);
    }
    return null;
}

export const addDate = (date: Date, days: number): Date => {
    let date2 = new Date(date.getTime());
    date2.setDate(date2.getDate() + days);
    return date2;
}
