import WelcomeSection from "@/components/homepage/WelcomeSection";
import React from "react";
import BoardsFeature from "@/components/homepage/BoardsFeature";
import WorkDetail from "@/components/homepage/WorkDetails";

const HomePage = () => {
  return (
    <main>
      <WelcomeSection />
      <BoardsFeature />
      <WorkDetail />
    </main>
  );
};

export default HomePage;
