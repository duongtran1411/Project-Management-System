// // components/TestKanban.tsx
// "use client";
// import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

// // Mock data
// const columnsFromBackend: Record<string, { title: string; items: { id: string; text: string }[] }> = {
//   "column-1": {
//     title: "To Do",
//     items: [{ id: "1", text: "Task A" }],
//   },
//   "column-2": {
//     title: "Done",
//     items: [{ id: "2", text: "Task B" }],
//   },
// };

// export default function TestKanban() {
//   const [columns, setColumns] = useState(columnsFromBackend);

//   const onDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const { source, destination } = result;

//     // same-column reorder
//     if (source.droppableId === destination.droppableId) {
//       const col = Array.from(columns[source.droppableId].items);
//       const [moved] = col.splice(source.index, 1);
//       col.splice(destination.index, 0, moved);
//       setColumns({
//         ...columns,
//         [source.droppableId]: {
//           ...columns[source.droppableId],
//           items: col,
//         },
//       });
//       return;
//     }

//     // cross-column move
//     const sourceCol = Array.from(columns[source.droppableId].items);
//     const destCol = Array.from(columns[destination.droppableId].items);
//     const [moved] = sourceCol.splice(source.index, 1);
//     destCol.splice(destination.index, 0, moved);
//     setColumns({
//       ...columns,
//       [source.droppableId]: {
//         ...columns[source.droppableId],
//         items: sourceCol,
//       },
//       [destination.droppableId]: {
//         ...columns[destination.droppableId],
//         items: destCol,
//       },
//     });
//   };

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       {Object.entries(columns).map(([colId, col]) => (
//         <Droppable key={colId} droppableId={colId}>
//           {(prov) => (
//             <div
//               ref={prov.innerRef}
//               {...prov.droppableProps}
//               style={{
//                 margin: 8,
//                 padding: 8,
//                 width: 200,
//                 minHeight: 200,
//                 background: "#eee",
//                 display: "inline-block",
//                 verticalAlign: "top",
//               }}
//             >
//               <h4>{col.title}</h4>
//               {col.items.map((item, idx) => (
//                 <Draggable key={item.id} draggableId={item.id} index={idx}>
//                   {(prov2) => (
//                     <div
//                       ref={prov2.innerRef}
//                       {...prov2.draggableProps}
//                       {...prov2.dragHandleProps}
//                       style={{
//                         padding: 8,
//                         marginBottom: 8,
//                         background: "white",
//                         border: "1px solid #ccc",
//                         ...prov2.draggableProps.style,
//                       }}
//                     >
//                       {item.text}
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {prov.placeholder}
//             </div>
//           )}
//         </Droppable>
//       ))}
//     </DragDropContext>
//   );
// }
