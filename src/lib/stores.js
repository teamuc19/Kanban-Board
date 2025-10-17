import { writable } from "svelte/store";

export const lanes = writable([
  { title: "DO",     color: "bg-slate-100 dark:bg-slate-800/40",     tasks: [] },
  { title: "DOING",  color: "bg-amber-50 dark:bg-amber-900/20",      tasks: [] },
  { title: "DONE",   color: "bg-emerald-50 dark:bg-emerald-900/20",  tasks: [] },
  { title: "ARCHIV", color: "bg-indigo-50 dark:bg-indigo-900/20",    tasks: [] }
]);
