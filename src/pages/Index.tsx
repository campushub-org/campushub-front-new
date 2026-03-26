import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Problems from "@/components/Problems";
import UserRoles from "@/components/UserRoles";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { motion, useScroll, useSpring } from "framer-motion";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 selection:bg-primary/10 selection:text-primary">
        {/* Progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
          style={{ scaleX }}
        />

        <Navbar />
        
        <main>
            <Hero />
            
            <section id="problems">
              <Problems />
            </section>
            
            <section id="features">
              <Features />
            </section>
            
            <section id="roles">
              <UserRoles />
            </section>
            
            <CTA />
            
            <Footer />
        </main>
    </div>
  );
};

export default Index;
