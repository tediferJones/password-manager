export default function capAndSplit(str: string[]) {
  // This function should take arg as a string, but I dont feel like updating all the
  // insert spaces into camelCase strings, i.e. 'myNameIsBob' = 'My Name Is Bob'
  return str.reduce((str, char, i) => {
    if (i === 0) return char.toUpperCase();
    if ('A' <= char && char <= 'Z') return `${str} ${char}`;
    return str + char;
  }, '')
}
