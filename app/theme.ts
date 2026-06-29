import { createTheme, rem } from "@mantine/core";

export const appTheme = createTheme({
  colors: {
    khaki: [
      "#f6f1e4",
      "#e8dec4",
      "#dac89f",
      "#ccb177",
      "#c19f59",
      "#ba9448",
      "#a7823c",
      "#927132",
      "#7f6127",
      "#6d511b",
    ],
    taupe: [
      "#f4efeb",
      "#e4d7cc",
      "#d2bcab",
      "#bfa089",
      "#b08a6d",
      "#a47b5b",
      "#91694c",
      "#805b43",
      "#704d39",
      "#5f3f2e",
    ],
    cambridge: [
      "#edf6f3",
      "#d7e8e1",
      "#add1c2",
      "#81baa2",
      "#5ea788",
      "#489a76",
      "#3a8b68",
      "#2d7858",
      "#21674a",
      "#12563c",
    ],
    tiffany: [
      "#eefcf8",
      "#d3f5ea",
      "#a7e9d5",
      "#78ddbe",
      "#55d3ac",
      "#3fcda1",
      "#31b68c",
      "#239f79",
      "#158a67",
      "#007354",
    ],
    poppy: [
      "#fff0ef",
      "#ffd9d6",
      "#fdb1aa",
      "#f8877d",
      "#f36255",
      "#f04939",
      "#ee3927",
      "#d42b1c",
      "#bd2015",
      "#a4140c",
    ],
  },
  primaryColor: "cambridge",
  primaryShade: { light: 6, dark: 8 },
  autoContrast: true,
  luminanceThreshold: 0.32,
  defaultRadius: "md",
  cursorType: "pointer",
  respectReducedMotion: true,
  fontFamily: '"Manrope", "Segoe UI", sans-serif',
  fontFamilyMonospace: '"IBM Plex Mono", "SFMono-Regular", monospace',
  headings: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    fontWeight: "700",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: rem(42), lineHeight: "1.05" },
      h2: { fontSize: rem(34), lineHeight: "1.1" },
      h3: { fontSize: rem(28), lineHeight: "1.15" },
      h4: { fontSize: rem(22), lineHeight: "1.2" },
      h5: { fontSize: rem(18), lineHeight: "1.25" },
      h6: { fontSize: rem(16), lineHeight: "1.3" },
    },
  },
  radius: {
    xs: rem(6),
    sm: rem(10),
    md: rem(14),
    lg: rem(20),
    xl: rem(28),
  },
  shadows: {
    xs: "0 1px 2px rgba(32, 26, 21, 0.08)",
    sm: "0 8px 24px rgba(32, 26, 21, 0.08)",
    md: "0 14px 40px rgba(32, 26, 21, 0.12)",
    lg: "0 18px 56px rgba(32, 26, 21, 0.18)",
    xl: "0 24px 72px rgba(32, 26, 21, 0.22)",
  },
  defaultGradient: {
    from: "khaki.4",
    to: "cambridge.6",
    deg: 132,
  },
  components: {
    Button: {
      defaultProps: {
        radius: "xl",
        size: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        shadow: "xs",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "xs",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    Alert: {
      defaultProps: {
        radius: "lg",
        variant: "light",
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
        variant: "light",
      },
    },
    Anchor: {
      defaultProps: {
        fw: "600",
      },
    },
  },
  other: {
    appShellMaxWidth: rem(960),
  },
});