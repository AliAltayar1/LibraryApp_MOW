import { Header } from "@/layout/Header";
import { Footer } from "@/layout/Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full" id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
