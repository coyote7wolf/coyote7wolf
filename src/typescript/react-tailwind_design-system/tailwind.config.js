import plugin from 'tailwindcss/plugin.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './.storybook/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      primary: {
        DEFAULT: '#2563eb',
        light: '#3b82f6',
        dark: '#1e40af',
        hover: '#1d4ed8',
        text: '#fff',
      },
      secondary: {
        DEFAULT: '#64748b',
        light: '#94a3b8',
        dark: '#334155',
        hover: '#475569',
        text: '#fff',
      },
      success: {
        DEFAULT: '#22c55e',
        dark: '#15803d',
        text: '#fff',
      },
      warning: {
        DEFAULT: '#fbbf24',
        dark: '#b45309',
        text: '#fff',
      },
      danger: {
        DEFAULT: '#ef4444',
        dark: '#991b1b',
        text: '#fff',
      },
      info: {
        DEFAULT: '#0ea5e9',
        dark: '#0369a1',
        text: '#fff',
      },
      background: {
        DEFAULT: '#f8fafc',
        dark: '#18181b',
      },
      surface: {
        DEFAULT: '#fff',
        dark: '#23272f',
      },
      border: {
        DEFAULT: '#e5e7eb',
        dark: '#334155',
      },
      text: {
        DEFAULT: '#1e293b',
        dark: '#f1f5f9',
        muted: '#64748b',
      },
      muted: {
        DEFAULT: '#64748b',
        dark: '#a3aed6',
      },
      disabled: {
        DEFAULT: '#a3a3a3',
        dark: '#52525b',
      },
      skeleton: {
        bg: '#e5e7eb',
      },
    },
    extend: {
      width: {
        'flex-box-sm': '2rem',
        'flex-box': '3rem',
        'flex-box-md': '4rem',
        'flex-box-lg': '6rem',
        'flex-full': '100%',
        sidebar: '16rem',
        sidebarCollapsed: '4rem',
      },
      height: {
        'flex-box-sm': '2rem',
        'flex-box': '3rem',
        'flex-box-md': '4rem',
        'flex-box-lg': '6rem',
      },
      minHeight: {
        'flex-area': '120px',
      },
      boxShadow: {
        dashboard: '0 2px 12px 0 rgb(0 0 0 / 0.10)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 8px 0 rgb(0 0 0 / 0.08)',
        lg: '0 2px 8px 0 rgb(0 0 0 / 0.12)',
        tooltip: '0 2px 8px 0 rgb(0 0 0 / 0.18)',
        sidebar: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', // shadow-lg
      },
      gridTemplateColumns: {
        'industry-2': 'repeat(2, minmax(0, 1fr))',
        'industry-3': 'repeat(3, minmax(0, 1fr))',
        'industry-4': 'repeat(4, minmax(0, 1fr))',
        'industry-5': 'repeat(5, minmax(0, 1fr))',
        'industry-6': 'repeat(6, minmax(0, 1fr))',
        'industry-autofit': 'repeat(auto-fit, minmax(12rem, 1fr))',
        'industry-autofit-minmax': 'repeat(auto-fit, minmax(12rem, 1fr))',
        'industry-autofill': 'repeat(auto-fill, minmax(10rem, 1fr))',
      },
      gap: {
        'industry-y': '1.5rem',
        'industry-x': '2rem',
      },
      keyframes: {
        'tooltip-fade': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'tooltip-fade': 'tooltip-fade 150ms cubic-bezier(0.4,0,0.2,1)',
      },
      spinner: {
        sizes: {
          xs: '0.75rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
        },
        thickness: {
          thin: '2px',
          normal: '3px',
          thick: '4px',
        },
        speeds: {
          slow: '1.25s',
          normal: '0.75s',
          fast: '0.5s',
        },
      },
      maxWidth: {
        container: '1024px',
        containerResponsive: '1280px',
      },
      spacing: {
        'tooltip-x': '0.5rem',
        'tooltip-y': '0.25rem',
        'tooltip-arrow': '6px',
        'container-px': '1rem',
      },
      borderRadius: {
        dashboard: '12px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '9999px',
        tooltip: '6px',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, theme, addUtilities }) {
      addUtilities({
        '.statistic': {
          fontSize: theme('statistic.fontSize'),
          fontWeight: theme('statistic.fontWeight'),
          color: theme('statistic.color'),
        },
        '.statistic-trend-up': {
          color: theme('statistic.trendColor'),
        },
        '.statistic-animate': {
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        '.statistic-responsive': {
          width: theme('statistic.responsiveWidth'),
        },
        '@screen sm': {
          '.statistic-responsive': {
            width: theme('statistic.responsiveWidthSm'),
          },
        },
        '.statistic-light': {
          backgroundColor: theme('statistic.lightBg'),
        },
        '.statistic-dark': {
          backgroundColor: theme('statistic.darkBg'),
          color: theme('statistic.darkText'),
        },
        '.statistic-mobile': {
          maxWidth: theme('statistic.mobileMaxWidth'),
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      });
      addUtilities({
        '.skeleton': {
          backgroundColor: theme('skeleton.bg'),
          borderRadius: theme('skeleton.rounded'),
          display: 'inline-block',
        },
        '.skeleton-animate': {
          animation: theme('skeleton.animation'),
          width: theme('skeleton.width'),
          height: theme('skeleton.height'),
        },
        '.skeleton-size': {
          width: theme('skeleton.width'),
          height: theme('skeleton.height'),
        },
        '.skeleton-responsive': {
          width: theme('skeleton.responsiveWidth'),
          height: theme('skeleton.height'),
        },
        '@screen sm': {
          '.skeleton-responsive': {
            width: theme('skeleton.responsiveWidthSm'),
            height: theme('skeleton.height'),
          },
        },
      });
      addComponents({
        '.bg-progressbar-fill': {
          backgroundColor: theme('colors.progressbar-fill', '#2563eb'),
        },
        '.bg-progressbar-bg': {
          backgroundColor: theme('colors.progressbar-bg', '#f3f4f6'),
        },
        '.border-progressbar': {
          borderColor: theme('colors.progressbar-border', '#e5e7eb'),
        },
        '.bg-progressbar-success': {
          backgroundColor: theme('colors.progressbar-success', '#22c55e'),
        },
        '.bg-progressbar-error': {
          backgroundColor: theme('colors.progressbar-error', '#ef4444'),
        },
        '.bg-progressbar-warning': {
          backgroundColor: theme('colors.progressbar-warning', '#fbbf24'),
        },
        '.bg-progressbar-info': {
          backgroundColor: theme('colors.progressbar-info', '#3b5fff'),
        },
        '.sidebar-industry': {
          backgroundColor: theme('colors.sidebar.bg'),
          color: theme('colors.sidebar.text'),
          border: `1px solid ${theme('colors.sidebar.border')}`,
          width: theme('width.sidebar'),
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          boxShadow: theme('boxShadow.sidebar'),
        },
        '.sidebar-collapsed-industry': {
          backgroundColor: theme('colors.sidebar.bg'),
          color: theme('colors.sidebar.text'),
          border: `1px solid ${theme('colors.sidebar.border')}`,
          width: theme('width.sidebarCollapsed'),
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          boxShadow: theme('boxShadow.sidebar'),
        },
        '.sidebar-responsive-industry': {
          backgroundColor: theme('colors.sidebar.bg'),
          color: theme('colors.sidebar.text'),
          border: `1px solid ${theme('colors.sidebar.border')}`,
          width: theme('width.sidebar'),
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          boxShadow: theme('boxShadow.sidebar'),
          '@screen sm': {
            width: theme('width.sidebarCollapsed'),
          },
        },
        '.container-industry': {
          backgroundColor: theme('colors.container.bg'),
          color: theme('colors.container.text'),
          border: `1px solid ${theme('colors.container.border')}`,
          maxWidth: theme('maxWidth.container'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.container-px'),
          paddingRight: theme('spacing.container-px'),
        },
        '.container-responsive-industry': {
          backgroundColor: theme('colors.container.bg'),
          color: theme('colors.container.text'),
          border: `1px solid ${theme('colors.container.border')}`,
          maxWidth: theme('maxWidth.containerResponsive'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.container-px'),
          paddingRight: theme('spacing.container-px'),
        },
        '.container-full-industry': {
          backgroundColor: theme('colors.container.bg'),
          color: theme('colors.container.text'),
          border: `1px solid ${theme('colors.container.border')}`,
          maxWidth: 'none',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.container-px'),
          paddingRight: theme('spacing.container-px'),
        },
        '.tooltip-multiline': {
          whiteSpace: 'pre-line',
        },
        '.tooltip-animate': {
          animation: theme('animation.tooltip-fade'),
        },
        '.tooltip-arrow': {
          position: 'absolute',
          width: theme('spacing.tooltip-arrow'),
          height: theme('spacing.tooltip-arrow'),
          backgroundColor: 'inherit',
          transform: 'rotate(45deg)',
          zIndex: '49',
        },
        '.tooltip-arrow-top': {
          left: '50%',
          bottom: `calc(-${theme('spacing.tooltip-arrow')} / 2)`,
          transform: 'translateX(-50%) rotate(45deg)',
        },
        '.tooltip-arrow-bottom': {
          left: '50%',
          top: `calc(-${theme('spacing.tooltip-arrow')} / 2)`,
          transform: 'translateX(-50%) rotate(45deg)',
        },
        '.tooltip-arrow-left': {
          top: '50%',
          right: `calc(-${theme('spacing.tooltip-arrow')} / 2)`,
          transform: 'translateY(-50%) rotate(45deg)',
        },
        '.tooltip-arrow-right': {
          top: '50%',
          left: `calc(-${theme('spacing.tooltip-arrow')} / 2)`,
          transform: 'translateY(-50%) rotate(45deg)',
        },
        '.dark .tooltip': {
          backgroundColor: theme('colors.tooltip.darkBg'),
          color: theme('colors.tooltip.darkText'),
        },
        '.tooltip-trigger': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500',
          position: 'relative',
          borderRadius: theme('borderRadius.sm'),
          cursor: 'pointer',
          transitionProperty: 'background-color,color',
          transitionDuration: '150ms',
          outline: 'none',
        },
        '.tooltip-trigger-sm': {
          '@apply text-xs': {},
          padding: '0.25rem 0.5rem',
        },
        '.tooltip-trigger-md': {
          '@apply text-sm': {},
          padding: '0.375rem 0.75rem',
        },
        '.tooltip-trigger-lg': {
          '@apply text-sm': {},
          padding: '0.5rem 1rem',
        },
        // Variants map to existing semantic colors
        '.tooltip-trigger-primary': {
          backgroundColor: theme('colors.primary.DEFAULT'),
          color: theme('colors.primary.text'),
        },
        '.dark .tooltip-trigger-primary': {
          backgroundColor: theme('colors.primary.dark'),
          color: theme('colors.primary.darkText'),
        },
        '.tooltip-trigger-primary:hover': {
          backgroundColor: theme('colors.primary.hover'),
        },
        '.tooltip-trigger-primary:active': {
          backgroundColor: theme('colors.primary.active'),
        },
        '.tooltip-trigger-secondary': {
          backgroundColor: theme('colors.secondary.DEFAULT'),
          color: theme('colors.secondary.darkText'),
        },
        '.tooltip-trigger-secondary:hover': {
          backgroundColor: theme('colors.secondary.hover'),
        },
        '.tooltip-trigger-danger': {
          backgroundColor: theme('colors.danger.DEFAULT'),
          color: theme('colors.danger.text'),
        },
        '.tooltip-trigger-danger:hover': {
          filter: 'brightness(0.95)',
        },
        '.tooltip-trigger-danger:active': {
          filter: 'brightness(0.85)',
        },
        '.tooltip-trigger-success': {
          backgroundColor: theme('colors.success.DEFAULT'),
          color: theme('colors.success.text'),
        },
        '.tooltip-trigger-success:hover': {
          filter: 'brightness(0.95)',
        },
        '.tooltip-trigger-warning': {
          backgroundColor: theme('colors.warning.DEFAULT'),
          color: theme('colors.warning.text'),
        },
        '.tooltip-trigger-warning:hover': {
          filter: 'brightness(0.95)',
        },
        '.tooltip-trigger-info': {
          backgroundColor: theme('colors.info.DEFAULT'),
          color: theme('colors.info.text'),
        },
        '.tooltip-trigger-info:hover': {
          filter: 'brightness(0.95)',
        },
        '.tooltip-trigger-rounded': {
          borderRadius: theme('borderRadius.full'),
        },
        '.tooltip-trigger-disabled': {
          '@apply opacity-50 cursor-not-allowed': {},
        },
        '.tooltip-trigger-loading': {
          '@apply relative': {},
        },
        '.tooltip-spinner': {
          '@apply animate-spin': {},
          width: '1rem',
          height: '1rem',
          borderRadius: '9999px',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: theme('colors.foreground.DEFAULT'),
          borderTopColor: 'transparent',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        },
        '.spinner': {
          display: 'inline-block',
          borderRadius: '9999px',
          borderStyle: 'solid',
          borderColor: 'currentColor',
          borderRightColor: 'transparent',
          animation: 'spin var(--spinner-speed, 0.75s) linear infinite',
          width: theme('spinner.sizes.md'),
          height: theme('spinner.sizes.md'),
          borderWidth: theme('spinner.thickness.normal'),
        },
        '.spinner-xs': { width: theme('spinner.sizes.xs'), height: theme('spinner.sizes.xs') },
        '.spinner-sm': { width: theme('spinner.sizes.sm'), height: theme('spinner.sizes.sm') },
        '.spinner-md': { width: theme('spinner.sizes.md'), height: theme('spinner.sizes.md') },
        '.spinner-lg': { width: theme('spinner.sizes.lg'), height: theme('spinner.sizes.lg') },
        '.spinner-xl': { width: theme('spinner.sizes.xl'), height: theme('spinner.sizes.xl') },
        '.spinner-thickness-thin': { borderWidth: theme('spinner.thickness.thin') },
        '.spinner-thickness-normal': { borderWidth: theme('spinner.thickness.normal') },
        '.spinner-thickness-thick': { borderWidth: theme('spinner.thickness.thick') },
        '.spinner-speed-slow': { '--spinner-speed': theme('spinner.speeds.slow') },
        '.spinner-speed-normal': { '--spinner-speed': theme('spinner.speeds.normal') },
        '.spinner-speed-fast': { '--spinner-speed': theme('spinner.speeds.fast') },
        '.spinner-primary': { color: theme('colors.primary.DEFAULT') },
        '.dark .spinner-primary': { color: theme('colors.primary.dark') },
        '.spinner-secondary': { color: theme('colors.secondary.DEFAULT') },
        '.spinner-success': { color: theme('colors.success.DEFAULT') },
        '.spinner-danger': { color: theme('colors.danger.DEFAULT') },
        '.spinner-warning': { color: theme('colors.warning.DEFAULT') },
        '.spinner-info': { color: theme('colors.info.DEFAULT') },
        '.spinner-muted': { color: theme('colors.muted.DEFAULT') },
        '.skeleton': {
          backgroundColor: theme('colors.skeleton.bg', '#e5e7eb'),
          borderRadius: theme('borderRadius.sm'),
          display: 'inline-block',
        },
        '.skeleton--animate': {
          '@apply animate-pulse': {},
        },
        '.skeleton--w-16': {
          width: theme('skeleton.width', '4rem'),
        },
        '.skeleton--h-4': {
          height: theme('skeleton.height', '1rem'),
        },
        '.skeleton--w-full': {
          width: theme('skeleton.responsiveWidth', '100%'),
        },
        '.skeleton--sm-w-32': {
          '@screen sm': { width: theme('skeleton.responsiveWidthSm', '8rem') },
        },
        '.spinner-overlay': {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 60,
        },
        '.dark .spinner-overlay': {
          backgroundColor: 'rgba(0,0,0,0.55)',
        },
      });
      addComponents({
        '@media (prefers-reduced-motion: reduce)': {
          '.tooltip-animate': {
            animation: 'none',
          },
          '.spinner': {
            animation: 'none',
          },
          '.spinner-speed-slow, .spinner-speed-normal, .spinner-speed-fast': {
            animation: 'none',
          },
        },
      });
      addComponents({
        '.avatar': {
          '@apply inline-flex items-center justify-center overflow-hidden select-none font-medium relative border':
            {},
          backgroundColor: theme('colors.avatar.bg'),
          color: theme('colors.avatar.text'),
          borderColor: theme('colors.avatar.border'),
        },
        '.avatar-img': {
          '@apply w-full h-full object-cover': {},
        },
        '.avatar-text': {
          '@apply flex items-center justify-center w-full h-full': {},
        },
        '.avatar-placeholder': {
          '@apply flex items-center justify-center w-full h-full text-xs': {},
        },
        '.avatar-sm': {
          width: '2rem',
          height: '2rem',
          fontSize: '0.75rem',
        },
        '.avatar-md': {
          width: '3rem',
          height: '3rem',
          fontSize: '0.875rem',
        },
        '.avatar-lg': {
          width: '4rem',
          height: '4rem',
          fontSize: '1rem',
        },
        '.avatar-circle': {
          borderRadius: theme('borderRadius.full'),
        },
        '.avatar-square': {
          borderRadius: theme('borderRadius.md'),
        },
        '.avatar-online': {
          '@apply ring-2 ring-offset-2': {},
          '--tw-ring-color': theme('colors.avatar.status.online'),
          '--tw-ring-offset-color': theme('colors.avatar.offset'),
        },
        '.avatar-offline': {
          '@apply ring-2 ring-offset-2': {},
          '--tw-ring-color': theme('colors.avatar.status.offline'),
          '--tw-ring-offset-color': theme('colors.avatar.offset'),
        },
        '.avatar-busy': {
          '@apply ring-2 ring-offset-2': {},
          '--tw-ring-color': theme('colors.avatar.status.busy'),
          '--tw-ring-offset-color': theme('colors.avatar.offset'),
        },
        '.avatar-away': {
          '@apply ring-2 ring-offset-2': {},
          '--tw-ring-color': theme('colors.avatar.status.away'),
          '--tw-ring-offset-color': theme('colors.avatar.offset'),
        },
        '.dark .avatar': {
          backgroundColor: theme('colors.avatar.dark.bg'),
          color: theme('colors.avatar.dark.text'),
          borderColor: theme('colors.avatar.dark.border'),
        },
        '.dark .avatar-online': {
          '--tw-ring-color': theme('colors.avatar.dark.status.online'),
          '--tw-ring-offset-color': theme('colors.avatar.dark.offset'),
        },
        '.dark .avatar-offline': {
          '--tw-ring-color': theme('colors.avatar.dark.status.offline'),
          '--tw-ring-offset-color': theme('colors.avatar.dark.offset'),
        },
        '.dark .avatar-busy': {
          '--tw-ring-color': theme('colors.avatar.dark.status.busy'),
          '--tw-ring-offset-color': theme('colors.avatar.dark.offset'),
        },
        '.dark .avatar-away': {
          '--tw-ring-color': theme('colors.avatar.dark.status.away'),
          '--tw-ring-offset-color': theme('colors.avatar.dark.offset'),
        },
        '.flex-row-industry': {
          display: 'flex',
          flexDirection: 'row',
        },
        '.flex-col-industry': {
          display: 'flex',
          flexDirection: 'column',
        },
        '.flex-center-industry': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.flex-align-start': { alignItems: 'flex-start' },
        '.flex-align-center': { alignItems: 'center' },
        '.flex-align-end': { alignItems: 'flex-end' },
        '.flex-align-baseline': { alignItems: 'baseline' },
        '.flex-justify-start': { justifyContent: 'flex-start' },
        '.flex-justify-center': { justifyContent: 'center' },
        '.flex-justify-end': { justifyContent: 'flex-end' },
        '.flex-justify-between': { justifyContent: 'space-between' },
        '.flex-justify-around': { justifyContent: 'space-around' },
        '.flex-justify-evenly': { justifyContent: 'space-evenly' },
        '.flex-wrap-industry': { flexWrap: 'wrap' },
      });
    }),
  ],
};
