/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Grammar } from 'nearley'
// @ts-ignore
import grammarRules from './grammar.ne'

export const coolscriptGrammar: Grammar = Grammar.fromCompiled(grammarRules)
