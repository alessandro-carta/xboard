/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-diem`;

// File statici
// Non necessitano aggiornamento
const NOUPDATE_FILES = [
    '/icon-back.svg',
    '/icon-cancel.svg',
    '/icon-confirm.svg',
    '/icon-delete.svg',
    '/icon-edit.svg',
    '/icon-logout-3.svg',
    '/icon-offline.svg',
    '/icon-logo.svg',
    'offline.html'
];

// Necessitano aggiornamento
const STATIC_FILES = [
    '/style.css',
];

self.addEventListener('install', event => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(NOUPDATE_FILES);
        await cache.addAll(STATIC_FILES);
    }
    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', event => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }
    event.waitUntil(deleteOldCaches());
});


self.addEventListener('fetch', event => {
    async function respond() {

        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);
        
        // Se file statico leggo in cache
        if (NOUPDATE_FILES.includes(url.pathname)) {
            return cache.match(url.pathname);
        }
        if (STATIC_FILES.includes(url.pathname)) {
            try{
                // Se sono ONLINE
                // Aggiorno la cache
                const response = await fetch(event.request);
                cache.put(event.request, response.clone());
                return cache.match(url.pathname);
            } catch {
                return cache.match(url.pathname);
            }

        }

        try {
            // Sono ONLINE
            const response = await fetch(event.request);
            return response;
        } catch {
            // Sono OFFLINE
            // Fallback page
            const cachedResponse = await cache.match("offline.html");
            return cachedResponse;
        }
    }

    event.respondWith(respond());
   
});