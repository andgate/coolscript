module.exports = {
  moduleDirectories: ['<rootDir>/node_modules'],
  transform: {
    '^.+\\.tsx?$': 'es-jest'
  },
  testRegex: '(/tests/.*.(test|spec)).(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['(tests/.*.mock).(jsx?|tsx?)$'],
  verbose: true
}
