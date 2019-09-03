function filterInt(value) {
    if (/^([0-9]{4})$/.test(value))
        return Number(value);
    return NaN;
}

function isWeekDay(moment) {
    const FRIDAY = 5;
    return moment.isoWeekday() <= FRIDAY;
}

export { filterInt, isWeekDay };
