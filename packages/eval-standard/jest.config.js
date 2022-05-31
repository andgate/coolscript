const base = require('../../jest.config.base.js')
const { name: packageName } = require('./package.json')

module.exports = {
  ...base,
  displayName: packageName,
  rootDir: './',
  moduleNameMapper: {
    '^@coolscript\/eval-standard$': `<rootDir>/src`
  }
}
