<script lang="ts">
    import { userStore } from "../dbConfig";

    let email:string = '';
    let password:string = '';

    let errorAuth:boolean = false;
    let errorReset:boolean = false;
    let click:boolean = false;
</script>

<div class="container">
	<form>
		<input bind:value={email} type="email" placeholder="Email" class="{errorAuth ? 'error-input' : ''} input-form" required/>
		<input bind:value={password} type="password" placeholder="Password" class="{errorAuth ? 'error-input' : ''} input-form"/>

        {#if errorAuth}<label for="errore" class="error-label"> Email/Password non corretta </label>{/if}
        {#if errorReset}<label for="errore" class="error-label"> Email non trovata </label>{/if}
        
        <button on:click={ async () => {
            if(email !== '') errorAuth = await userStore.login(email, password)
        }} class="button-form">Accedi</button>

        <button class="user-header__button {click ? 'none' : ''}" on:click={async () => { 
            if(email !== '') {
                errorReset = await userStore.reset(email);
                click = true;
            }
        }}>Password dimenticata</button>

        
	</form>	
</div>