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
