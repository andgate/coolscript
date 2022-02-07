const base = require('../../jest.config.base.js')
const { name: packageName } = require('./package.json')

module.exports = {
  ...base,
  name: packageName,
  displayName: packageName,
  rootDir: './',
  moduleNameMapper: { '^@coolscript\/syntax-concrete$': '<rootDir>/src' }
}
