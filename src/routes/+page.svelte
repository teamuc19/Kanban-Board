<script>
    let listA = $state([1,2,3,4]);
    let listB = $state([]);
    import { flip } from "svelte/animate";

    function startFromA(item, event) {
        event.dataTransfer.setData("text/plain", item);
    } 
    function dragOver(event){
        event.preventDefault();
    }

    function dropToB(event){
        let item = event.dataTransfer.getData("text/plain");
        listA = listA.filter(i => i != item);
        listB.push(item);
    }
    function startFromB(item, event) {
        event.dataTransfer.setData("text/plain", item);
    }


    function dropToA(event){
        let item = event.dataTransfer.getData("text/plain");
        listB = listB.filter(i => i != item);
        listA.push(item);
    }
</script>

<h1 class="text-center"> We learn how to drag and drop! </h1>

<main class="p-32 w-full bg-gray-500 h-[500px] flex justify-between items-center">
 
<section class="bg-white h-[350px] w-[200px] space-y-2" ondragover={dragOver} ondrop={dropToA}>
        {#each listA as item (item)}
            <article
                ondragstart={(event) => startFromA(item, event)}
                class="p-4 bg-purple-400"
                draggable="true"
                animate:flip
            >{item}</article>
        {/each}
    </section>

   
<section class="bg-white h-[350px] w-[200px] space-y-2" ondragover={dragOver} ondrop={dropToB}>
        {#each listB as item (item)}
            <article
                ondragstart={(event) => startFromB(item, event)}
                class="p-4 bg-purple-400"
                draggable="true"
                animate:flip
            >{item}</article>
        {/each}
    </section>
</main>
