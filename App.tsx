import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import GitaReader from './components/GitaReader';
import VaishnavGeet from './components/VaishnavGeet';
import TempleLocator from './components/TempleLocator';
import NewsSection from './components/NewsSection';
import Pilgrimage from './components/Pilgrimage';
import Affirmations from './components/Affirmations';
import { LanguageProvider } from './components/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/affirmations" element={<Affirmations />} />
            <Route path="/gita" element={<GitaReader />} />
            <Route path="/bhajans" element={<VaishnavGeet />} />
            <Route path="/pilgrimage" element={<Pilgrimage />} />
            <Route path="/temples" element={<TempleLocator />} />
            <Route path="/news" element={<NewsSection />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default App;