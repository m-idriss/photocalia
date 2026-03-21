/** Harmonious color palette for events — shared across converter and calendar */
export const EVENT_COLORS = [
  { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' }, // Blue
  { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' }, // Violet
  { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' }, // Cyan
  { bg: '#f59e0b', border: '#d97706', text: '#ffffff' }, // Amber
  { bg: '#10b981', border: '#059669', text: '#ffffff' }, // Emerald
  { bg: '#ec4899', border: '#db2777', text: '#ffffff' }, // Pink
  { bg: '#f97316', border: '#ea580c', text: '#ffffff' }, // Orange
  { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' }, // Indigo
  { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' }, // Teal
  { bg: '#ef4444', border: '#dc2626', text: '#ffffff' }, // Red
];

export type EventColor = (typeof EVENT_COLORS)[0];

/**
 * Generate a consistent color for an event based on its title.
 * Same title always produces the same color across components.
 */
export function getEventColor(title: string): EventColor {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}
