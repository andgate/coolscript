import { CompiledRules } from 'nearley'

declare module '*.ne' {
  const value: CompiledRules
  export default value
}
