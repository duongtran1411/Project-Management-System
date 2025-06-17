import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  automationContent,
  boardsContent,
  reportsContent,
  timelineContent,
} from "@/data/BoardsFeatureConent";

type Feature = {
  title: string;
  desc: string;
};

type Props = {
  label: string; // (nên sửa lại là label nếu là "nhãn")
  listContent: Feature[];
  image: string;
};

const TabConent: React.FC<Props> = ({ label, listContent, image }) => {
  return (
    <section>
      <div className="flex flex-row w-full max-w-6xl gap-12 mt-8 font-charlie text-base/6 tracking-wider text-black">
        <div className="flex-1 flex flex-col gap-6 justify-center">
          <h3 className="text-2xl font-semibold text-[#253858] mb-2">
            {label}
          </h3>
          <ul className="space-y-4 text-[15px]">
            {listContent.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-left">
                <CheckOutlined className="text-black-700 mt-1" />
                <span className=" font-[450]">
                  <span className=" text-sm/6 font-[700]">{feature.title}</span>{" "}
                  {feature.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <img
          src={image}
          alt="board"
          className="w-[757px] h-[473px] object-cover shadow-lg object-left"
        />
      </div>
    </section>
  );
};

const items: TabsProps["items"] = [
  {
    key: "1",
    label: (
      <span className="active:bg-[#cfe1fd] rounded-[50px] py-[10px] px-[30px] border-solid  text-[20px] text-center text-[#1c2b42] mb-[10px]">
        Boards
      </span>
    ),
    children: (
      <TabConent
        label="Powerful agile boards"
        listContent={boardsContent}
        image="/board.png"
      />
    ),
  },
  {
    key: "2",
    label: (
      <span className="active:bg-[#cfe1fd] rounded-[50px] py-[10px] px-[30px] border-solid  text-[20px] text-center text-[#1c2b42] mb-[10px]">
        Reports
      </span>
    ),
    children: (
      <TabConent
        label="Reports and insights"
        listContent={reportsContent}
        image="/homepage1.png"
      />
    ),
  },
  {
    key: "3",
    label: (
      <span className="active:bg-[#cfe1fd] rounded-[50px] py-[10px] px-[30px] border-solid  text-[20px] text-center text-[#1c2b42] mb-[10px]">
        Timeline
      </span>
    ),
    children: (
      <TabConent
        label="Timeline"
        listContent={timelineContent}
        image="/timeline.png"
      />
    ),
  },
  {
    key: "4",
    label: (
      <span className="active:bg-[#cfe1fd] rounded-[50px] py-[10px] px-[30px] border-solid  text-[20px] text-center text-[#1c2b42] mb-[10px]">
        Automation
      </span>
    ),
    children: (
      <TabConent
        label="Automation"
        listContent={automationContent}
        image="/homepage1.png"
      />
    ),
  },
];

const BoardsFeature: React.FC = () => {
  return (
    <section className="w-full flex flex-col items-center py-16 bg-white">
      <h2 className="text-[36px] font-[500] text-center text-[#253858] mb-4 text-center">
        Discover the features that make Jira so easy to use
      </h2>
      <Tabs
        defaultActiveKey="1"
        className="mb-8 mt-4 m-auto"
        items={items}
        centered={true}
        tabBarStyle={{ borderBottom: "none" }}
      />
    </section>
  );
};

export default BoardsFeature;
