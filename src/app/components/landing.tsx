import { LandingNav } from "./landing/nav";
import { LandingHero } from "./landing/hero";
import { LandingFeatures } from "./landing/features";
import { LandingHowItWorks } from "./landing/how-it-works";
import { LandingPricing } from "./landing/pricing";
import { LandingCta } from "./landing/cta";
import { LandingFooter } from "./landing/footer";

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative overflow-hidden font-sans">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingCta />
      <LandingFooter />

      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-[#0052FC]/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.02] blur-[120px] pointer-events-none" />
    </div>
  );
}
