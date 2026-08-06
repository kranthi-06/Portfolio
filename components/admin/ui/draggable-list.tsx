"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Plus } from "lucide-react";
import { AIAssistantField } from "./ai-assistant-field";

interface DraggableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
  contextType?: string;
}

export function DraggableList({ items = [], onChange, label, placeholder, contextType }: DraggableListProps) {
  const [newItem, setNewItem] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    onChange(reordered);
  };

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="admin-label">{label}</label>
      
      {isMounted && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`droppable-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {items.map((item, index) => (
                <Draggable key={`${index}-${item.substring(0, 10)}`} draggableId={`${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-start gap-2 bg-[var(--admin-bg)] border border-[var(--admin-line)] rounded-xl p-2 ${
                        snapshot.isDragging ? 'shadow-lg ring-1 ring-[var(--admin-accent)]/50 opacity-90' : ''
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="mt-2 text-[var(--admin-ink-muted)] hover:text-[var(--admin-ink)] cursor-grab active:cursor-grabbing px-1"
                      >
                        <GripVertical size={16} />
                      </div>
                      <div className="flex-1">
                        <AIAssistantField 
                          value={item} 
                          onChange={(v) => handleItemChange(index, v)} 
                          contextType={contextType || label} 
                          hideLabel 
                          placeholder={placeholder}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="mt-2 p-1 text-[var(--admin-ink-muted)] hover:text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      )}

      <div className="flex gap-2 items-start mt-2">
        <div className="flex-1">
          <AIAssistantField 
            value={newItem}
            onChange={setNewItem}
            placeholder={`Add new ${label.toLowerCase()}...`}
            contextType={contextType || label}
            hideLabel
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="admin-btn admin-btn-secondary h-[42px] mt-0"
          disabled={!newItem.trim()}
        >
          <Plus size={16} /> Add
        </button>
      </div>
    </div>
  );
}
