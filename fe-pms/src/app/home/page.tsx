import WelcomeSection from "@/components/homepage/WelcomeSection";
import React from "react";
import BoardsFeature from "@/components/homepage/BoardsFeature";
import WorkDetail from "@/components/homepage/WorkDetails";
import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header";

const HomePage = () => {
  return (
    <main>
      <Header />
      <WelcomeSection />
      <BoardsFeature />
      <WorkDetail />
      <Footer />
    </main>
  );
};

export default HomePage;
