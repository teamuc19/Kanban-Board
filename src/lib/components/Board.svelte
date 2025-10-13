<script>
  import Lane from "./Lane.svelte";
  import TaskDialog from "./TaskDialog.svelte";
  import { lanes } from "$lib/stores";

  let showDialog = false;
  let newTask = { title: "", desc: "", due: "" };

  function addTask() {
    if (!newTask.title.trim()) { alert("Title required!"); return; }
    lanes.update((all) => {
      const task = { ...newTask, id: Date.now(), created: new Date().toISOString() };
      all[0].tasks.push(task); // immer in "Do"
      return all.slice();
    });
    newTask = { title: "", desc: "", due: "" };
    showDialog = false;
  }

  function closeDialog() { showDialog = false; }
</script>


<!-- Rest bleibt gleich -->

<TaskDialog {showDialog} {newTask} {addTask} {closeDialog} />
