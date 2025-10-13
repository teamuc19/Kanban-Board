import { writable } from "svelte/store";

export const lanes = writable([
  { title: "Do",     color: "bg-slate-100 dark:bg-slate-800/40",     tasks: [] },
  { title: "Doing",  color: "bg-amber-50 dark:bg-amber-900/20",      tasks: [] },
  { title: "Done",   color: "bg-emerald-50 dark:bg-emerald-900/20",  tasks: [] },
  { title: "Archiv", color: "bg-indigo-50 dark:bg-indigo-900/20",    tasks: [] }
]);
