<script lang="ts">
	import { userStore } from "../dbConfig";

    let email:string = ''
    let password:string = '';
    let name:string = ''
    let surname:string = '';
    let checkPassword:string = '';

    let errorAuth:boolean = false;
    let errorPass:boolean = false;
    let errorCompare:boolean = false;

    function regPass(password:string){
        let regex = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
        if(!regex.test(password)) {
            errorPass = true;
            return false;
        }
        return true;
    }
    
</script>

<div class="container">	
	<form>
		<input bind:value={email} type="email" placeholder="Email" class="{errorAuth ? 'error-input' : ''} input-form" required/>
        {#if errorAuth}<label for="errore" class="error-label"> Email già esistente </label>{/if}

        <input bind:value={name} type="text" placeholder="Nome" class="input-form" required/>
		<input bind:value={surname} type="text" placeholder="Cognome" class="input-form" required/>
        <input bind:value={password} type="password" placeholder="Password" class="{errorPass ? 'error-input' : errorCompare ? 'error-input': ''} input-form" required/>
        <input bind:value={checkPassword} type="password" placeholder="Conferma password" class="{errorPass ? 'error-input' : errorCompare ? 'error-input': ''} input-form" required/>
        <label for="password" class="password-label {errorPass ? 'error-label' : ''}">Password deve essere almeno di 8 caratteri alfanumerici, deve avere almeno una lettera Maiuscola e un numero 0-9</label>
        <label for="password" class="password-label {errorCompare ? 'error-label' : ''}">Le password devono corrispondere.</label>

        
        <button on:click={async () => {
            if(password != checkPassword) errorCompare = true;
            if(email !== '' && name !== '' && password !== '' && surname !== '' && regPass(password) && password == checkPassword) errorAuth = await userStore.signup(email, password, name, surname)
        }} class="button-form">Registrati</button>
	</form>
</div>