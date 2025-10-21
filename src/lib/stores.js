import { writable } from "svelte/store";

export const lanes = writable([
  { title: "DO",     color: "bg-white dark:bg-slate-900", tasks: [] },
  { title: "DOING",  color: "bg-white dark:bg-slate-900", tasks: [] },
  { title: "DONE",   color: "bg-white dark:bg-slate-900", tasks: [] },
  { title: "ARCHIV", color: "bg-white dark:bg-slate-900", tasks: [] }
]);
