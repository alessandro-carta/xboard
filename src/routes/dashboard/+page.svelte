<script lang="ts">
    import { boardStore } from '../../dbConfig'
    import { userStore } from '../../dbConfig'
    import BoardItem from '../../lib/BoardItem.svelte'
    import UserHeader from '../../lib/UserHeader.svelte'

    import { onMount } from 'svelte';
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { app } from '../../firebase-config';
    import { goto } from '$app/navigation';

    let dato:string='';
    let nuova:boolean = false;
    let aggiungi:boolean = false;
    let errorCode:boolean = false;

    const auth = getAuth(app);

    onMount(async () => {
        onAuthStateChanged(auth, (user) => {
            if ($userStore) {
                // signed in
                boardStore.getBoards($userStore.uid);
            } else {
                // signed out
                goto('/');
            }
        });
    });
    
    
</script>


{#if $userStore}
<div class="container">
    <UserHeader/>

    <form>
        <input bind:value={dato} type="text" placeholder="Inserisci titolo o codice" class="{errorCode ? 'error-input' : ''} input-form-line" required/>
        {#if errorCode}<label for="errore" class="error-label">Codice errato</label>{/if}
        <div>
            <button type="button" class="button-form" on:click={ () => {
                if($userStore && dato != '') boardStore.createBoard(dato, $userStore.uid);
                dato = '';
            }}>CREA</button>

            <button type="button" class="button-form" on:click={ async () => {
                if($userStore && dato != '') errorCode = await boardStore.addBoard(dato, $userStore.uid);
                if(!errorCode) dato = '';
            }}>ISCRIVITI</button>
        </div>
    </form>

    {#each $boardStore as board}
        <div class="boards">
            <BoardItem {board} />
        </div>
    {/each}
</div>

{:else}
<div class="container" style="margin-top: 40vh;">
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
</div>
{/if}



