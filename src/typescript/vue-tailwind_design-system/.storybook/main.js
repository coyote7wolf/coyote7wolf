export default {
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs', '@storybook/addon-a11y'],

  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}
