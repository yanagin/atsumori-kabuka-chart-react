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
