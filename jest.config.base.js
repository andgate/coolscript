module.exports = {
  moduleDirectories: ['<rootDir>/node_modules'],
  transform: {
    '^.+\\.tsx?$': 'es-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['(*.mock).(jsx?|tsx?)$'],
  verbose: true
}
