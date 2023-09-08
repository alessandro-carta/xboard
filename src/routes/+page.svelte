<script lang="ts">
    import { userStore } from '../dbConfig'
    import { onMount } from 'svelte';
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { app } from '../firebase-config';
    import { goto } from '$app/navigation';
    import LoginForm from "../lib/LoginForm.svelte";
    import SignupForm from "../lib/SignForm.svelte";


    const auth = getAuth(app);

    let register:boolean = false;

    onMount(async () => {
        onAuthStateChanged(auth, (user) => {
            if ($userStore) {
                // signed in
                goto('/dashboard');
            } else {
                // signed out
                goto('/');
            }
        });
    });
    
</script>



{#if !register}
    <div class="container">
        <h1 class="titolo-principale">Accedi al tuo account</h1>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        Non hai un account? <p on:click={() => {register = true;}} on:keydown={() => {}} class="link">Registrati</p> 
    </div>
    <LoginForm/>
{:else}
    <div class="container">
        <h1 class="titolo-principale">Crea nuovo account</h1>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        Hai già un account? <p on:click={() => {register = false;}} on:keydown={() => {}} class="link">Accedi</p> 
    </div>
    <SignupForm/>
{/if}