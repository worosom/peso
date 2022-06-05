export default {
  tracking: 'Partenza',
  offline: 'Scaricare le tracce',
  remove: 'Rimuovere la traccia',
  download: 'Scarica la traccia',
  downloadAll : {
    title: 'Dimensione del download ~100 Megabyte',
    text: 'Si raccomanda la connessione WiFi.',
    cancel: 'Cancella',
    continue: 'Continua',
  },
  deleteAll : {
    title: 'Attenzione',
    text: 'Vuoi cancellare tutte le tracce?',
    yes: 'Sì',
    no: 'No',
  },
  geolocationAlert : {
    title: 'Iniziare la geolocalizzazione',
    text: `Questa app raccoglie i dati di localizzazione per consentire la riproduzione audio a Ginevra anche quando l'app è chiusa o non in uso. 
    Nessuna informazione sull'utente o sulla localizzazione viene inviata ai nostri server. Assicurati che il tuo telefono lo permetta sempre, altrimenti l'app non potrà funzionare correttamente.`,
    cancel: 'Cancella',
    enable: 'Abilita il tracciamento',
  },
  info: [
    {content: `Premere **Partenza** e attiva la modalità di tracciamento. Quando cammini nella zona di una scultura, la musica si attiverà automaticamente. 

Se non hai una connessione internet stabile, **Scarica tutte le tracce** temporaneamente. 

Oppure **Scarica la traccia** singola cliccando su ogni indicatore.

Per un'esperienza migliore, usa le cuffie.

Per eliminare la musica dal tuo smartphone, disattiva semplicemente il pulsante **Scarica tutte le tracce** o **Scarica la traccia**.`, type: 'markdown' },
    {content: 'la musica non è caricata', type: 'text', style: {color: 'blue'}},
    {content: 'la musica è caricata', type: 'text', style: {color: 'green'}},
    {content: 'download della musica in corso', type: 'text', style: {color: 'orange'}},
    {content: 'musica in riproduzione', type: 'text', style: {color: 'red'}},
    {content: 'Credits', url: 'http://www.zonoff.net/belvederesonore/index.php/credits/', type: 'link'},
    {content: 'Politica sulla privacy', url: 'https://dispatchwork.info/peso/policy.html', type: 'link'}
  ],
}