<script lang="ts">
    import { postStore } from '../dbConfig'
    import { userStore, type Usertype } from '../dbConfig'
    import type { Post } from '../dbConfig'; 

    export let post:Post;

    let newText:string = post.text;
    let update:boolean = false;
    let emailInfo:boolean = false;
    
</script>

<article class="card">
    {#if $userStore && post.creator != $userStore.uid}
        <div class="header-post">
            {#await userStore.getUser(post.creator) then user}
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <p class="header-post__name" on:mouseover={() => {emailInfo = true}} on:mouseout={() => {emailInfo = false}}>{user.name} {user.surname}</p>
                {#if emailInfo}
                    <p class="header-post__email">{user.email}</p>
                {/if}
                 
            {/await}
        </div>
    {/if}
    {#if !update}
        <p>{post.text}</p>
        {#if $userStore && $userStore.uid == post.creator}
            <div class="function-post">
                <button class="user-header__button" on:click={() => {
                    newText = post.text;
                    update = true;
                }}>
                    <img src="icon-edit.svg" alt="">
                </button>

                <button class="user-header__button" on:click={() => { 
                    postStore.delPost(post.id)
                }}>
                    <img src="icon-delete.svg" alt="">
                </button>
            </div>
        {/if}
    {:else}
        <textarea bind:value={newText} placeholder="Testo*" class="input-form" rows="4" cols="80" required/>

        <div class="function-post">
            <button class="user-header__button" on:click={async () => {
                await postStore.updatePost(post.id,newText);
                update = false;
            }}>
                <img src="icon-confirm.svg" alt="">
            </button>

            <button class="user-header__button" on:click={() => { update = false }}>
                <img src="icon-cancel.svg" alt="">
            </button>
        </div>
    {/if}

</article>