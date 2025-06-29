export default {
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(\\@supabase)/)'],
  moduleNameMapper: {
    '^react$': 'react',
    '^.+\\.(css|less)$': 'identity-obj-proxy',
    '^react-big-calendar\\/.*\\.css$': 'identity-obj-proxy',
  },
};
