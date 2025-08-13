import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Card from "./card";
import type { CardType } from "./card";
import type { FC } from "react";

export type ColumnType = {
  id: string;
  title: string;
  cards: CardType[];
};

const Column: FC<ColumnType> = ({ id, title, cards }) => {
  const { setNodeRef } = useDroppable({ id: id });
  return (
    <SortableContext id={id} items={cards} strategy={rectSortingStrategy}>
      <div ref={setNodeRef} className="m-2 bg-white p-4 rounded-md">
        <p className="text-gray-800">{title}</p>
        {cards.map((card) => (
          <Card key={card.id} id={card.id} title={card.title}></Card>
        ))}
      </div>
    </SortableContext>
  );
};

export default Column;