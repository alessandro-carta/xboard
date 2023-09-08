<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "../dbConfig";
    import type { Usertype } from "../dbConfig";

    let user:Usertype;
    onMount(async () => {
        if($userStore) user = await userStore.getUser($userStore.uid);
    });

</script>

<div class="user-header" id="user-header">
    {#if $userStore && user}
        <h3 class="user-header__item">Ciao, {user.name} {user.surname}</h3>
        <button class="user-header__item user-header__button" on:click={() => {userStore.logout()}}>
            <img src="icon-logout-3.svg" alt="">
        </button>
    {/if}
</div>