// "use client";
// import React, { forwardRef } from "react";
// import styled from "@emotion/styled";
// // import CustomAvatar from '../TableComponents/CustomAvatar'
// // import { ReactComponent as RedArrow } from '../../assets/icons/High.svg'
// // import { ReactComponent as YellowArrow } from '../../assets/icons/Medium.svg'
// // import { ReactComponent as BlueArrow } from '../../assets/icons/Low.svg'
// interface TaskInformationProps {
//   isDragging?: boolean;
// }
// const TaskInformation = styled.div<TaskInformationProps>`
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: flex-start;
//   padding: 0 15px;
//   min-height: 106px;
//   border-radius: 5px;
//   max-width: 311px;
//   /* background: ${({ isDragging }) =>
//     isDragging ? "rgba(255, 59, 59, 0.15)" : "white"}; */
//   background: white;
//   margin-top: 15px;

//   .secondary-details {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     width: 100%;
//     font-size: 12px;
//     font-weight: 400px;
//     color: #7d7d7d;
//   }
//   /* .priority{ */
//   /* margin-right: 12px; */
//   /* align-self: center;
//     svg{
//       width: 12px !important;
//       height: 12px !important;
//       margin-right: 12px; */
//   /* margin-top: 2px; */
//   /* } */
//   /* } */
// `;

// interface Task {
//   id: string;
//   Task: string;
//   Assigned_To: string;
//   Assignee: string;
//   Status: string;
//   Priority: string;
//   Due_Date: string;
// }
// interface TaskCardProps {
//   item: Task;
  
// }

// const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
//   ({ item, ...rest }, ref) => {
//     return (
//       <TaskInformation ref={ref} {...rest}>
//         <p>{item.Task}</p>
//       </TaskInformation>
//     );

    
//   }
// );

// TaskCard.displayName = "TaskCard";

// export default TaskCard;

// // <span className="priority">
// // {item.Priority === 'High' ? (<RedArrow />) : item.Priority === 'Medium' ? (<YellowArrow />) : (<BlueArrow />)}
// // </span>
// // <div><CustomAvatar name={item.Assignee} isTable={false} size={16} /></div>
