import '../src/index.css';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';

/** @type { import('@storybook/react').Preview } */

/** Storybook Design Token & Theme Skeleton **/

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: '國際化語言',
    defaultValue: 'zh',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'zh', title: '中文' },
        { value: 'en', title: 'English' },
      ],
    },
  },
};

export const decorators = [
  (Story: React.FC, context: { globals: { locale: string } }) => {
    // Use a function component to use hooks
    const Decorator = () => {
      React.useEffect(() => {
        i18n.changeLanguage(context.globals.locale);
      }, [context.globals.locale]);
      return (
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      );
    };
    return <Decorator />;
  },
];

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: 'light', color: '#fff', default: true },
        { name: 'dark', class: 'dark', color: '#18181b' },
      ],
    },
  },
};

export const parameters = {
  options: {
    storySort: {
      order: [],
      method: 'alphabetical',
    },
  },
};

export default preview;
