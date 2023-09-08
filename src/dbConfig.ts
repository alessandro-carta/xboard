import { app } from "./firebase-config";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, initializeFirestore, onSnapshot, persistentLocalCache, persistentMultipleTabManager, query, where } from 'firebase/firestore';
import { writable } from "svelte/store";
import { goto } from '$app/navigation';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";

const auth = getAuth(app);

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

function newNotify(text:string){
    // Controlla che il browser supporta le Notification API
    if (!("Notification" in window)) {
        alert("Questo browser non supporta le notifiche desktop");
    }

    // Controlla che siano già stati dati i permessi per inviare la notifica
    else if (Notification.permission === "granted") {
        var notification = new Notification(text, {icon: '/icon-logo.svg'});
    }

    // Altrimenti chiede all'utente di accettare o meno le notifiche
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                var notification = new Notification(text, {icon: '/icon-logo.svg'});
            }
        });
    }
}

export interface Post {
    id: string;
    text: string;
    creator:string;
    board:string;
}

let unsubscribe:any;

function storePost(){
    const { subscribe, set, update } = writable<Post[]>([]);

    // Crea un nuovo post nella lavagna
    async function addPost(text:string, creator:string, board:string) {
        try {
            const docRef = await addDoc(collection(db, "posts"), {text: text, creator: creator, board: board});            
        } catch (e) {
            console.error(`Error adding ${text}`, e);
        }
    }

    // Crea un listener sui post della lavagna e notifica quando qualcuno scrive
    async function getPosts(creator:string, board:string, load:boolean=true) {
        const Dataquery = query(collection(db, 'posts'), where("board", "==", board));
        unsubscribe = onSnapshot(Dataquery, (querySnapshot) => {
            querySnapshot.docChanges().forEach( async (change) => {
                if (!load && change.doc.data().creator != creator && change.type === "added") {
                    let user = await userStore.getUser(change.doc.data().creator);
                    newNotify(`${user.email}: New Post! `)
                }
            });
            load = false;
            const newData = querySnapshot.docs.map((d) => ({id: d.id, text: d.data().text, creator: d.data().creator, board: d.data().board}));
            postStore.set(newData);
        });
    }

    // Cancella un post
    async function delPost(id:string){
        try {
            await deleteDoc(doc(db, 'posts', id));
        } catch (e) {
            console.error(`error deleting ${id}`);
        }
    }

    // Modifica un post
    async function updatePost(id:string, text:string) {
        await setDoc(doc(db, "posts", id), {
            text: text
        }, { merge: true });
    }

    return {addPost, getPosts, delPost, updatePost, subscribe, set, update};
}

export const postStore = storePost();

export interface Board {
    id: string;
    title: string;
    father:string;
    users:string[];
}

function storeBoard(){
    const { subscribe, set, update } = writable<Board[]>([]);

    // Crea una lavagna
    async function createBoard(title:string, father:string) {
        try {
            const refBoard = await addDoc(collection(db, "boards"), {title: title, father: father, users: [father]});
        } catch (e) {
            console.error(`Error adding ${title}`, e);
        }
    }

    // Restituisce le lavagne di un utente
    async function getBoards(user:string) {
        const Dataquery = query(collection(db, 'boards'), where("users", "array-contains", user));
        const unsubscribe = onSnapshot(Dataquery, (querySnapshot) => {
            const newData = querySnapshot.docs.map( (d) => ({
                id: d.id,
                title: d.data().title,
                father: d.data().father,
                users: d.data().users,
            }));
            boardStore.set(newData);
        });
    }

    // Restituisce una lavagna dato il suo id
    async function getBoard(id:string):Promise<Board|undefined> {
        const d = await getDoc(doc(db, "boards", id));
        if(d.exists()) return {id: d.id, title: d.data().title, father: d.data().father, users: d.data().users};
        else return undefined;
    }


    // Abbandona la lavagna
    async function quitBoard(board:Board|undefined, user:string) {
        board = await boardStore.getBoard(board!.id);
        if(board != undefined){
            board.users = board.users.filter(b => b != user);
    
            const data = await getDocs(query(collection(db, "posts"), where("creator", "==", user), where("board", "==", board.id)));
            data.forEach( (doc) => {
                postStore.delPost(doc.id);
            })
    
            if(user == board.father && board.users.length != 0){
                board.father = board.users[0];
            }
            if(board.users.length == 0){
                await deleteDoc(doc(db, "boards", board.id));
                goto("/dashboard");
            }
    
            if(board.users.length != 0){
                await setDoc(doc(db, "boards", board.id), board);
                goto("/dashboard");
            }

            unsubscribe();

        }
        

        
    }

    // Iscrizione ad un lavagna tramite codice
    async function addBoard(id:string, user:string){
        const data = await getDoc(doc(db, "boards", id));
        let b:string[] = []; 
        if(data.exists()) {
            b = data.data().users;
            if(b.filter(b => b == user).length != 0) return true;
            b.push(user);
            await setDoc(doc(db, "boards", id), { users: b }, { merge: true });
            return false;
        }
        else return true;
    }

    return {createBoard, getBoards, quitBoard, getBoard, addBoard, subscribe, set, update };
}

export const boardStore = storeBoard();





export interface Usertype {
    id: string;
    email: string;
    name: string;
    surname: string;
}

function funUserStore() {
    const { subscribe, set, update } = writable<User|undefined>();

    // Dato id resitutisce le informazione di un utente
    async function getUser(user:string):Promise<Usertype>{
        const u = await getDoc(doc(db, "users", user));
        if(u.exists()) {
            return {id: u.id, email: u.data().email, name: u.data().name, surname: u.data().surname}
        }
        else return {id: '', email: '', name: '', surname: ''};
    }

    // Restituisce l'elenco degli utenti (dettagliato) di una lavagna
    async function getUsers(user:string[]):Promise<Usertype[]>{
        let res:Usertype[] = []
        for(let i = 0; i < user.length; i++){
            const u = await getDoc(doc(db, "users", user[i]));
            if(u.exists()) {
                res.push({id: u.id, email: u.data().email, name: u.data().name, surname: u.data().surname})
            }
        }
        return res; 
    }

    // Gestione del login
    async function login(email: string, pwd: string) {
        try {
            await signInWithEmailAndPassword(auth, email, pwd)
            return false;
        } catch (err:any) {
            if(err.code == 'auth/network-request-failed') window.location.reload();
            console.error('ERROR signin with email and password:', err);
            return true;
        }
    }

    // Gestione della registrazione
    async function signup(email: string, pwd: string, name:string, surname:string) {
        try {
            let user = await createUserWithEmailAndPassword(auth, email, pwd);
            await setDoc(doc(db, "users", user.user.uid), {
                email: email,
                name: name,
                surname: surname
            });
            return false;
        } catch (err:any) {
            if(err.code == 'auth/network-request-failed') window.location.reload();
            console.error('ERROR signup with email and password:', err);
            return true;
        }

    }

    // Gestione del logout
    async function logout() {
        await signOut(auth);
        if(unsubscribe) unsubscribe();
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // signed in
            userStore.set(user);
        } else {
            // signed out
            userStore.set(undefined);
        }
    });

    // Reset della password
    async function reset(email:string) {
        try{
            await sendPasswordResetEmail(auth, email);
            return false;
        } catch(err) {
            console.error('ERROR reset password:', err);
            return true;
        }
    }

    

    return {
        subscribe, set, update, login, logout, signup, getUser, getUsers, reset
    };
}

export const userStore = funUserStore(); 
