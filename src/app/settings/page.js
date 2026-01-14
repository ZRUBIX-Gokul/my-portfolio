"use client";

import React, { useState } from "react";
import { 
  Sun, 
  Moon, 
  Type, 
  Palette, 
  GripVertical, 
  Layout, 
  Check,
  RotateCcw
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableItem({ item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm mb-2 group ${isDragging ? 'shadow-xl' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
        <span className="ml-2 text-[10px] text-gray-400 uppercase font-bold tracking-tight">{item.type}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { 
    theme, setTheme, 
    fontFamily, setFontFamily, 
    backgroundColor, setBackgroundColor,
    sidebarLayout, setSidebarLayout 
  } = useSettings();

  const [localBg, setLocalBg] = useState(backgroundColor);

  const fonts = [
    { name: "Standard (Geist)", value: "'Geist Sans', sans-serif" },
    { name: "Inter", value: "'Inter', sans-serif" },
    { name: "Roboto", value: "'Roboto', sans-serif" },
    { name: "Outfit", value: "'Outfit', sans-serif" },
    { name: "Playfair Display", value: "'Playfair Display', serif" },
    { name: "System", value: "system-ui, -apple-system, sans-serif" }
  ];

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSidebarLayout((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleApplyBg = () => setBackgroundColor(localBg);
  const handleReset = () => {
    setTheme("light");
    setFontFamily("'Geist Sans', sans-serif");
    setBackgroundColor("#f9fafb");
    setLocalBg("#f9fafb");
    // Layout reset could be added if needed
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Personalize your workspace and layout</p>
        </div>
        <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
            <RotateCcw className="w-4 h-4" /> Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Visual Settings */}
        <div className="space-y-6">
          
          {/* Theme */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                {theme === 'light' ? <Sun className="w-5 h-5 text-amber-600" /> : <Moon className="w-5 h-5 text-amber-400" />}
              </div>
              <h2 className="text-lg font-semibold dark:text-white">Appearance</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20' : 'border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-gray-400'}`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-900/20 text-blue-400 ring-2 ring-blue-500/20' : 'border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-gray-400'}`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Type className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold dark:text-white">Typography</h2>
            </div>
            
            <div className="space-y-1">
              {fonts.map((f) => (
                <button 
                  key={f.name}
                  onClick={() => setFontFamily(f.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${fontFamily === f.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                >
                  <span style={{ fontFamily: f.value }}>{f.name}</span>
                  {fontFamily === f.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold dark:text-white">Workspace Background</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <input 
                  type="color" 
                  value={localBg}
                  onChange={(e) => setLocalBg(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white dark:border-zinc-800 shadow-lg"
                />
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  value={localBg}
                  onChange={(e) => setLocalBg(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm font-mono"
                />
                <button 
                   onClick={handleApplyBg}
                   className="w-full py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                >
                  Apply Background
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Layout Arrangement */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Layout className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Menu Arrangement</h2>
              <p className="text-xs text-gray-500">Drag items to reorder sidebar links</p>
            </div>
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sidebarLayout.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {sidebarLayout.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
             <p className="text-xs text-center text-gray-400 italic">
               Reordering happens instantly across your workspace
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
