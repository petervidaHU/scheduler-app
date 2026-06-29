import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  colors: {
    khaki: [
      'hsla(44, 11%, 60%, 1)', // main
      'hsla(44, 11%, 70%, 1)',
      'hsla(44, 11%, 80%, 1)',
      'hsla(44, 11%, 90%, 1)',
      'hsla(44, 11%, 50%, 1)',
      'hsla(44, 11%, 40%, 1)',
      'hsla(44, 11%, 30%, 1)',
      'hsla(44, 11%, 20%, 1)',
      'hsla(44, 11%, 10%, 1)',
      'hsla(44, 11%, 5%, 1)',
    ],
    taupe: [
      'hsla(25, 19%, 26%, 1)', // main
      'hsla(25, 19%, 36%, 1)',
      'hsla(25, 19%, 46%, 1)',
      'hsla(25, 19%, 56%, 1)',
      'hsla(25, 19%, 16%, 1)',
      'hsla(25, 19%, 10%, 1)',
      'hsla(25, 19%, 20%, 1)',
      'hsla(25, 19%, 30%, 1)',
      'hsla(25, 19%, 40%, 1)',
      'hsla(25, 19%, 50%, 1)',
    ],
    cambridge: [
      'hsla(163, 18%, 50%, 1)', // main
      'hsla(163, 18%, 60%, 1)',
      'hsla(163, 18%, 70%, 1)',
      'hsla(163, 18%, 80%, 1)',
      'hsla(163, 18%, 40%, 1)',
      'hsla(163, 18%, 30%, 1)',
      'hsla(163, 18%, 20%, 1)',
      'hsla(163, 18%, 10%, 1)',
      'hsla(163, 18%, 5%, 1)',
      'hsla(163, 18%, 15%, 1)',
    ],
    tiffany: [
      'hsla(159, 51%, 80%, 1)', // main
      'hsla(159, 51%, 90%, 1)',
      'hsla(159, 51%, 70%, 1)',
      'hsla(159, 51%, 60%, 1)',
      'hsla(159, 51%, 50%, 1)',
      'hsla(159, 51%, 40%, 1)',
      'hsla(159, 51%, 30%, 1)',
      'hsla(159, 51%, 20%, 1)',
      'hsla(159, 51%, 10%, 1)',
      'hsla(159, 51%, 5%, 1)',
    ],
    poppy: [
      'hsla(356, 70%, 51%, 1)', // main
      'hsla(356, 70%, 61%, 1)',
      'hsla(356, 70%, 71%, 1)',
      'hsla(356, 70%, 81%, 1)',
      'hsla(356, 70%, 41%, 1)',
      'hsla(356, 70%, 31%, 1)',
      'hsla(356, 70%, 21%, 1)',
      'hsla(356, 70%, 11%, 1)',
      'hsla(356, 70%, 6%, 1)',
      'hsla(356, 70%, 16%, 1)',
    ],
  },
  primaryColor: 'cambridge', // Use cambridge-blue for buttons
  primaryShade: 0,
  defaultGradient: {
    from: 'khaki',
    to: 'cambridge',
    deg: 45,
  },
  fontFamily: 'Roboto, sans-serif',
  fontFamilyMonospace: 'Roboto Mono, monospace',
  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
  components: {
    Button: {
      styles: {
        root: {
          backgroundColor: 'hsla(163, 18%, 50%, 1)', // cambridge-blue
          color: '#fff',
          '&:hover': {
            backgroundColor: 'hsla(163, 18%, 40%, 1)',
          },
        },
      },
    },
    Text: {
      styles: {
        root: {
          color: 'hsla(44, 11%, 60%, 1)', // khaki
        },
      },
    },
  },
  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },
});
