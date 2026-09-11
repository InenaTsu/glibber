/* Service Worker - nur dafuer da, dass das Spiel auf dem Handy ohne Netz startet.
   Wird ausschliesslich ueber http(s) benutzt; beim Doppelklick auf index.html (file://)
   meldet sich hier nichts an, siehe die Registrierung am Ende von index.html.

   Bewusst NETZ ZUERST und nicht Zwischenspeicher zuerst: Ist eine Verbindung da, kommt
   immer der aktuelle Stand. Sonst wuerde der Zwischenspeicher genau den Fehler
   zurueckholen, vor dem HANDOVER.md Abschnitt 2 warnt - gespielt wird eine alte Version,
   waehrend die Versionsnummer im Titel schon eine neue verspricht. Der Zwischenspeicher
   ist nur das Netz-Ersatzteil und wird bei jedem erfolgreichen Abruf aufgefrischt.
   Deshalb muss der Name hier auch bei neuen Spielversionen NICHT hochgezaehlt werden. */
var CACHE = "glibber";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(FILES); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var kopie = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, kopie); });
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m || caches.match("./index.html");
      });
    })
  );
});
