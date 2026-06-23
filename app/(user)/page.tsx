import HeroSection from "@/app/components/HeroSection";
import CaraPengajuan from "@/app/components/CaraPengajuan";
import JenisSuratSection from "@/app/components/JenisSuratSection";
import Footer from "@/app/components/Footer";

export default function HomePage() {
  return (
    <main className="home-page">
      <HeroSection />
      <CaraPengajuan />
      <JenisSuratSection />
      <Footer />
    </main>
  );
}