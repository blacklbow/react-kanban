import {
    closestCorners,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragOverEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Column, { type ColumnType } from "./column";
import { useState } from "react";


const Main = () => {
    // 仮データを定義
    const data: ColumnType[] = [
        {
            id: "column-1", title: "column-1", cards: [
                { id: "card-1", title: "Card 1" },
                { id: "card-2", title: "Card 2" },
                { id: "card-3", title: "Card 3" }
            ]
        },
        {
            id: "column-2", title: "column-2", cards: [
                { id: "card-4", title: "Card 4" },
                { id: "card-5", title: "Card 5" }
            ]
        }
    ];

    const [columns, setColumns] = useState<ColumnType[]>(data);

    const findColumn = (cardId: string | null) => {
        // overの対象がcolumnの場合があるためそのままidを返す
        if (columns.some((c) => c.id === cardId)) {
            return columns.find((c) => c.id === cardId) ?? null;
        }
        // カードIDから対応するカラムを検索します。
        return columns.find((column) => column.cards.some((card) => card.id === cardId)) || null;
    };

    const handleDragOver = (event: DragOverEvent) => {
        console.log("handleDragOver", columns, event);
        // イベントでドラッグオーバーされた情報からcolumnを特定し、カードの順序を更新する処理を行います。
        const { active, over } = event;
        if (active.id !== over?.id) {
            const overColumn = findColumn(over?.id as string);
            if (!overColumn) {
                return;
            }
            const activeColumn = findColumn(active.id as string);
            if (!activeColumn) {
                return;
            }

            // overのカラムと activeのカラムが異なる場合、元のカラムからカードを削除し、順序を変えてoverのカラムに追加します。
            if (overColumn.id !== activeColumn.id) {
                const activeCards = activeColumn.cards.filter((card) => card.id !== active.id);
                const overCards = [...overColumn.cards, activeColumn.cards.find((card) => card.id === active.id)!];
                overCards.sort((a, b) => {
                    return overColumn.cards.findIndex((card) => card.id === a.id) - overColumn.cards.findIndex((card) => card.id === b.id);
                });

                setColumns((prevColumns) =>
                    prevColumns.map((column) =>
                        column.id === activeColumn.id
                            ? { ...column, cards: activeCards }
                            : column.id === overColumn.id
                                ? { ...column, cards: overCards }
                                : column
                    )
                );
            }
            // 同じカラム内でのドラッグオーバーの場合、カードの順序を更新します。
            else {
                const activeCards = overColumn.cards;
                const activeIndex = activeCards.findIndex((card) => card.id === active.id);
                const overIndex = activeCards.findIndex((card) => card.id === over?.id);

                if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                    const newCards = arrayMove(activeCards, activeIndex, overIndex);
                    setColumns((prevColumns) =>
                        prevColumns.map((column) =>
                            column.id === overColumn.id ? { ...column, cards: newCards } : column
                        )
                    );
                }
            }
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );
    return (
        <DndContext onDragOver={handleDragOver} sensors={sensors} collisionDetection={closestCorners}>
            <div className="flex flex-row m-4">
                {columns.map((column) => (
                    <Column
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        cards={column.cards}
                    ></Column>
                ))}
            </div>
        </DndContext>
    );
}

export default Main;