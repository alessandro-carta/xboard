<script lang="ts">
    import type { Board } from '../dbConfig'; 
    import { goto } from '$app/navigation';

    export let board:Board;
</script>

<article class="board">
    <p>{board.title}</p>
    <button class="button" on:click={() => goto(`/board?codBoard=${board.id}`)}>Entra</button>
</article>