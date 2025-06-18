import React from "react";

const WorkDetail: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#e8f0fb] to-[#d3e4f5] overflow-auto flex-col gap-[56px]">
      {/* Row 1 */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-[32px] items-center ">
        {/* Left: Board UI (dummy) */}
        <div>
          <img
            src="/board.png"
            alt="image"
            className="w-[560px] h-[349px] object-cover shadow-lg"
          />
        </div>

        {/* Right: Text */}
        <div className="flex flex-col text-left">
          <h1 className="text-[#253858] font-charlie font-[600]  text-left inline text-[32px]">
            Customize how your team’s work flows
          </h1>
          <div className="h-[1.5px] bg-[#cfe1fd] mt-[24px] mb-[40px]"></div>
          <p className="text-[#091e42] text-base/5 text-left font-charlie">
            Set up, clean up, and automate even the most complicated project
            workflows.
          </p>
        </div>
      </div>

      {/* Row 2 */}

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-[32px] items-center ">
        {/* Left: Text */}
        <div className="flex flex-col text-left">
          <h1 className="text-[#253858] font-charlie font-[600]  text-left inline text-[32px]">
            Stay on track – even when the track changes
          </h1>
          <div className="h-[1.5px] bg-[#cfe1fd] mt-[24px] mb-[40px]"></div>
          <p className="text-[#091e42] text-base/5 text-left font-charlie">
            Use the timeline view to map out the big picture, communicate
            updates to stakeholders, and ensure your team stays on the same
            page.
          </p>
        </div>
        {/* Right: Board UI (dummy) */}
        <div>
          <img
            src="/timeline.png"
            alt="image"
            className="w-[560px] h-[349px] object-cover shadow-lg object-left"
          />
        </div>
      </div>

      {/* Row 3 */}

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-[32px] items-center ">
        {/* Left: Board UI (dummy) */}
        <div>
          <img
            src="/jira_detail.png"
            alt="image"
            className="w-[560px] h-[349px] object-cover shadow-lg object-left"
          />
        </div>

        {/* Right: Text */}
        <div className="flex flex-col text-left">
          <h1 className="text-[#253858] font-charlie font-[600]  text-left inline text-[32px]">
            Bye-bye, spreadsheets
          </h1>
          <div className="h-[1.5px] bg-[#cfe1fd] mt-[24px] mb-[40px]"></div>
          <p className="text-[#091e42] text-base/5 text-left font-charlie">
            Keep every detail of a project centralized in real time so
            up-to-date info can flow freely across people, teams, and tools.
          </p>
        </div>
      </div>
    </main>
  );
};
export default WorkDetail;
