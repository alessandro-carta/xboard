<script lang="ts">
    import { postStore } from '../../dbConfig'
    import { boardStore } from '../../dbConfig'
    import { userStore } from '../../dbConfig'
    import PostItem from '../../lib/PostItem.svelte'

    import { onMount } from 'svelte';
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { app } from '../../firebase-config';
    import { goto } from '$app/navigation';
    import BoardItem from '$lib/BoardItem.svelte';
    import type { Board } from '../../dbConfig';
    import type { Usertype } from '../../dbConfig';
    import UserHeader from '$lib/UserHeader.svelte';
    import { writable } from 'svelte/store';

    let dato:string='';
    let idB:string|null = '';
    let board:Board|undefined = undefined;
    let nuova:boolean = false;
    let users:Usertype[] = [];
    let array = writable<string[]>([]);;

    const auth = getAuth(app);

    onMount(async () => {
        const url = new URL(window.location.href);
        idB = url.searchParams.get('codBoard');
        if(idB) board = await boardStore.getBoard(idB);
        onAuthStateChanged(auth, async () => {
            if ($userStore && board && board.users.filter(u => u == $userStore?.uid).length != 0) {
                // signed in
                postStore.getPosts($userStore.uid, board.id);
                users = await userStore.getUsers(board.users);
            } else {
                // signed out
                goto('/');
            }
        });
    });
    
    
</script>

{#if $userStore && board}
<div class="container">
    <UserHeader/>

    <div class="line">
        <button class="user-header__button" on:click={() => {window.location.href = '/dashboard'}}>
            <img src="icon-back.svg" alt="">
        </button>
        <h2>{board.title}</h2>
    </div>

    <form>
        <div class="line">
            <input bind:value={dato} type="text" class="input-form-line" style="width: auto;" placeholder="Crea un nuovo post" required>
            <button on:click={async () => {
                if($userStore && idB != null && dato != '') {
                    await postStore.addPost(dato, $userStore.uid, idB);
                    dato = '';
                }
            }} class="button-circle">+</button>
        </div>
    </form>

    <div class="board-info">
        <div class="board-info__header"> 
            <button class="user-header__button" on:click={() => { 
                document.getElementById("board-info")?.classList.toggle("none");;
            }}>Maggiori infomazioni</button>
        </div>

        <div class="none board-info-container" id="board-info">
            <div class="board-info-container-cards">
                <div class="board-info-container-cards__item">
                    <p>Codice (per condivisione):</p>
                    <p>{board.id}</p>
                </div>
        
                <div class="board-info-container-cards__item">
                    <p>Amministratore:</p>
                    {#each users.filter(user => user.id == board?.father) as f}
                        <p>{f.email}</p>
                    {/each}
                </div>
        
                <div class="board-info-container-cards__item">
                    <p>Partecipanti:</p>
                    {#each users as u}
                        <p>{u.email}</p>
                    {/each}
                </div>

                
            </div>

            <button type="button" class="button" on:click={ () => {
                if($userStore && board) boardStore.quitBoard(board, $userStore.uid);
            }}>ABBANDONA</button>

        </div>

    </div>

    {#each $postStore as post}
        <PostItem {post} />
    {/each}

</div>

{:else}
<div class="container" style="margin-top: 40vh;">
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
</div>
{/if}


