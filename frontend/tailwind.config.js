import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        base: "'Inter', sans-serif",
        heading: "'Inter', sans-serif",
        body: "'Inter', sans-serif",
        button: "'Inter', sans-serif",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.25rem",
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semiBold: "600",
        bold: "700",
      },
      colors: {
        textPrimary: "#2C2C34",
        textSecondary: "#71717A",
        primary: "#6C5CE7",
      },
      lineHeight: {
        snug: "1.25",
        relaxed: "1.5",
      },
      letterSpacing: {
        normal: "0",
        wide: "0.05em",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#EAE6FF",
              100: "#D1C4F9",
              200: "#B9A2F3",
              300: "#A080ED",
              400: "#8760E7",
              500: "#6C5CE7",
              600: "#5547C0",
              700: "#3E3399",
              800: "#281F72",
              900: "#140C4B",
              foreground: "#FFFFFF",
              DEFAULT: "#6C5CE7",
            },
            secondary: {
              50: "#EDEDEF",
              100: "#DADADF",
              200: "#C7C7CD",
              300: "#B1B1B8",
              400: "#9B9BA3",
              500: "#7F7F8A",
              600: "#65656F",
              700: "#4D4D58",
              800: "#383840",
              900: "#2C2C34",
              foreground: "#FFFFFF",
              DEFAULT: "#2C2C34",
            },
            success: {
              DEFAULT: "#17C964",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#F5A524",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#D00000",
              foreground: "#FFFFFF",
            },
            background: "#EDEEF0",
            foreground: {
              DEFAULT: "#2C2C34",
              foreground: "#FFFFFF",
            },
            content1: {
              DEFAULT: "#FFFFFF",
              foreground: "#2C2C34",
            },
            content2: {
              DEFAULT: "#F8F8FA",
              foreground: "#2C2C34",
            },
            content3: {
              DEFAULT: "#F1F1F5",
              foreground: "#2C2C34",
            },
            content4: {
              DEFAULT: "#E8E8EC",
              foreground: "#2C2C34",
            },
            focus: "#6C5CE7",
            overlay: "#00000033",
            divider: "#E4E4E7",
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#302C4F",
              100: "#463D72",
              200: "#5C4E95",
              300: "#725FB8",
              400: "#886FDB",
              500: "#9E80FF",
              600: "#A890E8",
              700: "#C3A7FF",
              800: "#D9C5FF",
              900: "#F0E4FF",
              foreground: "#FFFFFF",
              DEFAULT: "#6C5CE7",
            },
            secondary: {
              50: "#3A3A40",
              100: "#4A4A50",
              200: "#5C5C63",
              300: "#707078",
              400: "#868690",
              500: "#9E9EA8",
              600: "#B4B4BD",
              700: "#D0D0D5",
              800: "#DEDEE2",
              900: "#E9E9ED",
              foreground: "#FFFFFF",
              DEFAULT: "#E0E0E0",
            },
            success: {
              DEFAULT: "#17C964",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#F5A524",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#D00000",
              foreground: "#FFFFFF",
            },
            background: "#121212",
            foreground: {
              DEFAULT: "#FFFFFF",
              foreground: "#2C2C34",
            },
            content1: {
              DEFAULT: "#2A2A2F",
              foreground: "#FFFFFF",
            },
            content2: {
              DEFAULT: "#1F1F24",
              foreground: "#FFFFFF",
            },
            content3: {
              DEFAULT: "#141419",
              foreground: "#FFFFFF",
            },
            content4: {
              DEFAULT: "#0A0A0E",
              foreground: "#FFFFFF",
            },
            focus: "#725FB8",
            overlay: "#FFFFFF33",
            divider: "#3C3C44",
          },
        },
      },
    }),
  ],
};

export default tailwindConfig;
