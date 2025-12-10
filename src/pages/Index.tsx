import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Problems from "@/components/Problems";
import UserRoles from "@/components/UserRoles";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative overflow-hidden animated-bg">
        {/* Decorative Blobs */}
        <div className="absolute top-0 -left-1/4 w-[50rem] h-[50rem] bg-blue-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 -right-1/4 w-[50rem] h-[50rem] bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
        
        <main className="min-h-screen relative z-10">
            <Hero />
            <Problems />
            <Features />
            <UserRoles />
            <CTA />
            <Footer />
        </main>
    </div>
  );
};

export default Index;
