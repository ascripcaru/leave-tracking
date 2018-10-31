function filterInt(value) {
  if (/^([0-9]{4})$/.test(value))
    return Number(value);
  return NaN;
}

export { filterInt };
