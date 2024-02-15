export default function capAndSplit(str: string[], i = 0) {
  // Format camel case strings into plain english
  // i.e. 'myCamelCaseString' => 'My Camel Case String'

  if (!str[i]) return str.join('');
  if (i === 0) return capAndSplit(str.with(0, str[0].toUpperCase()), i + 1)
  if ('A' < str[i] && str[i] < 'Z') return capAndSplit(str.toSpliced(i, 0, ' '), i + 2)
  return capAndSplit(str, i + 1)
}
