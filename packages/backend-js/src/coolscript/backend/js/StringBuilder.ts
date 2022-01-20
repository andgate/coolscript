export class StringBuilder {
  substrings: string[] = []

  append(s: string) {
    this.substrings.push(s)
  }

  appendLine(s: string) {
    this.substrings.push(s, '\n')
  }

  toString(): string {
    return this.substrings.join('')
  }
}
