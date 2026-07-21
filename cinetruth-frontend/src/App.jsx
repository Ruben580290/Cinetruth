import Header from "./components/Header";
import Hero from "./components/Hero";
import AnalyzerPanel from "./components/AnalyzerPanel";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-cream text-ink paper-noise">
      <Header />
      <main>
        <Hero />
        <AnalyzerPanel />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

export default App;
