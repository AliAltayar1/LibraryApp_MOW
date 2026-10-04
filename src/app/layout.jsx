import localFont from "next/font/local";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { APP_CONFIG } from "@/lib/constants";

// Exact font family used on the official Syrian Ministry of Endowments website (mow.gov.sy)
const qomra = localFont({
  src: [
    {
      path: "../fonts/qomra/qomra-light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/qomra/qomra-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/qomra/qomra-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/qomra/qomra-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/qomra/qomra-black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-qomra",
  display: "swap",
});

export const metadata = {
  title: `${APP_CONFIG.name} | ${APP_CONFIG.ministryName}`,
  description: APP_CONFIG.description,
  keywords: [
    "وزارة الأوقاف السورية",
    "المكتبة الإلكترونية",
    "مخطوطات وقفية",
    "كتب إسلامية",
    "دمشق",
    "الفقه الإسلامي",
    "علوم القرآن",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={qomra.variable}>
      <body className="font-qomra min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-secondary/20 selection:text-primary">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
