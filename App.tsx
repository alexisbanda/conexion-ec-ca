import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { Benefits } from './components/Benefits';
import { EventsNews } from './components/EventsNews';
import { ResourcesTools } from './components/ResourcesTools';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModals } from './components/AuthModals';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollProgressBar />
        <Header />
        <main className="flex-grow">
          <Hero />
          <AboutUs />
          <Benefits />
          <EventsNews />
          <ResourcesTools />
          <ContactForm />
        </main>
        <Footer />
        <AuthModals />
      </div>
    </AuthProvider>
  );
};

export default App;