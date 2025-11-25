import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Problems from "@/components/Problems";
import UserRoles from "@/components/UserRoles";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problems />
      <Features />
      <UserRoles />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
