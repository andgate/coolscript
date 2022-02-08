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

export const lines = (text: string): string[] => {
  return text.split(/\r\n|\r|\n/)
}

export function TextSpan(text: string, line: number, col: number) {
  const n = text.length
  if (n == 0) {
    return Span(line, line, col, col)
  }

  const textLines = lines(text)
  const lineCount = textLines.length
  if (lineCount <= 1) {
    return Span(line, line, col, col + n)
  }

  const lastLine = textLines[lineCount - 1]
  const columnEnd = col + lastLine.length
  const lineEnd = line + lineCount - 1
  return Span(line, lineEnd, col, columnEnd)
}
