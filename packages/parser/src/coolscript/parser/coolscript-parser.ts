import * as nearley from 'nearley'
import { Term } from '@coolscript/syntax'
import { coolscriptGrammar } from './grammar'

export type ParseResult = {
  term: Term | null
  warnings: string[]
  errors?: Error[]
}

function ParseSuccess(term: Term, warnings: string[]): ParseResult {
  return { term, warnings }
}

function ParseFail(warnings: string[], ...errors: Error[]): ParseResult {
  return { term: null, errors, warnings }
}

export function parse(src: string): ParseResult {
  const parser = new nearley.Parser(coolscriptGrammar)
  const warnings = []
  try {
    parser.feed(src)
  } catch (error) {
    console.error(error)
    let errorMsg = ''
    if (error && error.stack && error.message) {
      errorMsg = ` Error message: ${error.message}`
    }
    const msg = `Parser failed!${errorMsg}`
    const parserFailedError = new Error(msg)
    return ParseFail(warnings, parserFailedError)
  }

  if (
    !parser.results ||
    !Array.isArray(parser.results) ||
    parser.results.length == 0
  ) {
    const noParseResultsError = new Error('No parse results were recovered.')
    return ParseFail(warnings, noParseResultsError)
  }

  if (parser.results.length > 1) {
    const ambiguousGrammarWarning = new Error(
      'Ambiguous grammar encountered! Resolving first result.'
    )
    warnings.push(ambiguousGrammarWarning)
  }
  const term: Term = parser.results[0] as Term // must assume at this point
  return ParseSuccess(term, warnings)
}
