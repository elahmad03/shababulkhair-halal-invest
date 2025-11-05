import Footer from "@/components/landing/footer";
import {Header} from "@/components/landing/header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <Header/>
      <main>{children}</main>
      <Footer />
    </div>
  );
}
