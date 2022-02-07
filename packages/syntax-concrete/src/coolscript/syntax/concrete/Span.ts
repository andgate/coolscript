export type Span = {
  type: 'Span'
  line: {
    start: number
    end: number
  }
  column: {
    start: number
    end: number
  }
}

export type Location = { span: Span }

export function Span(
  lineStart: number,
  lineEnd: number,
  columnStart: number,
  columnEnd: number
): Span {
  return {
    type: 'Span',
    line: {
      start: lineStart,
      end: lineEnd
    },
    column: {
      start: columnStart,
      end: columnEnd
    }
  }
}

export function Merge(spanLeft: Span, spanRight: Span): Span {
  return {
    type: 'Span',
    line: {
      start: spanLeft.line.start,
      end: spanRight.line.end
    },
    column: {
      start: spanLeft.column.start,
      end: spanRight.column.end
    }
  }
}

export function TextSpan(text: string, line: number, col: number) {
  const n = text.length
  if (n == 0) {
    return Span(line, line, col, col)
  }

  const isMultiLine = text.indexOf('\n') >= 0
  if (!isMultiLine) {
    return Span(line, line, col, col + n)
  }

  let lineEnd = line
  let columnEnd = col
  for (let i = 0; i < n; i++) {
    if (text.charAt(i) == '\n') {
      columnEnd = 0
      ++lineEnd
      continue
    }
    ++columnEnd
  }

  return Span(line, lineEnd, col, columnEnd)
}
