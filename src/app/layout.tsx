import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getI18n } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { cookies } from "next/headers";
import { THEME_COOKIE, isTheme } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.appName, template: `%s · ${t.appName}` },
    description: t.appTagline,
    applicationName: t.appName,
    appleWebApp: { capable: true, title: t.appName, statusBarStyle: "default" },
    icons: {
      icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getI18n();
  const theme = (await cookies()).get(THEME_COOKIE)?.value;
  return (
    <html lang={locale} data-theme={isTheme(theme) ? theme : undefined} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
