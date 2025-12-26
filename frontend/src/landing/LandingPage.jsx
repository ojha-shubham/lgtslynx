import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Security from "./Security";
import Pricing from "./Pricing";
import CTA from "./CTA";
import Footer from "./Footer";

export default function LandingPage({ onLaunch }) {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Security />
      {/* <Pricing /> */}
      <CTA onLaunch={onLaunch} />
      <Footer />
    </>
  );
}
