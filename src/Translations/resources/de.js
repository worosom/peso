export default {
  tracking: 'Starten',
  offline: 'Download Tracks',
  remove: 'Track entfernen',
  download: 'Track herunterladen',
  downloadAll : {
    title: 'Download-Größe ~100 Megabytes',
    text: 'WiFi-Verbindung empfohlen.',
    cancel: 'Abbrechen',
    continue: 'Weiter',
  },
  deleteAll : {
    title: 'Warnhinweis',
    text: 'Möchten Sie alle Tracks löschen?',
    yes: 'Ja',
    no: 'Nein',
  },
  geolocationAlert : {
    title: 'Geolokalisierung starten',
    text: `Diese App sammelt Standortdaten, um die Audiowiedergabe in Genf zu ermöglichen, auch wenn die App geschlossen ist oder nicht verwendet wird.
Es werden keine Benutzer- oder Tracking-Informationen an unsere Server gesendet.
Bitte stellen Sie sicher, dass Ihr Telefon dies immer zulässt, da die App sonst nicht richtig funktionieren kann.`,
    cancel: 'Abbrechen',
    enable: 'Tracking aktivieren',
  },
  info: [
    {content: `Drücken Sie auf **Starten** und lassen Sie den Tracking-Modus aktivieren.

Wenn Sie in die Zone einer Skulptur gehen, wird der Ton automatisch abgespielt.

Wenn Sie nicht über eine stabile Internetverbindung verfügen, laden Sie bitte vorübergehend **Alle Tracks** herunterladen.

Es ist möglich, jeden einzelnen **Track herunterzuladen**, indem Sie auf jeden Marker aktivieren.

Um ein besseres Erlebnis zu haben, benutzen Sie Ihre Kopfhörer.

Um die Musik von Ihrem Smartphone zu löschen, deaktivieren Sie einfach die Schaltfläche **Alle Tracks** herunterladen oder den **Track entfernen**.`, type: 'markdown'},
    {content: 'Musik nicht geladen', type: 'text', style: {color: 'blue'}},
    {content: 'Musik ist geladen', type: 'text', style: {color: 'green'}},
    {content: 'Musik wird gerade heruntergeladen', type: 'text', style: {color: 'orange'}},
    {content: 'Musik wird abgespielt oder ist ausgewählt', type: 'text', style: {color: 'red'}},
    {content: 'Impressum', url: 'http://www.zonoff.net/belvederesonore/index.php/credits/', type: 'link'},
    {content: 'Datenschutzrichtlinien', url: 'https://dispatchwork.info/peso/policy.html', type: 'link'}
  ],
}
