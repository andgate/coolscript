import { parse } from '@coolscript/parser'

export function cli(args: string) {
  console.log(parse(args))
}
