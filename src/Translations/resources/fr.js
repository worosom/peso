export default {
  tracking: 'On y vas',
  offline: 'Télécharger les pistes',
  remove: 'Supprimer la piste',
  download: 'Télécharger la piste',
  downloadAll : {
    title: 'Taille du téléchargement ~100 mégaoctets',
    text: 'Connexion WiFi recommandée.',
    cancel: 'Annuler',
    continue: 'Continuer',
  },
  deleteAll : {
    title: 'Attention',
    text: 'Vous voulez supprimer toutes les pistes ?',
    yes: 'Oui',
    no: 'Non',
  },
  geolocationAlert : {
    title: 'Démarrer la géolocalisation',
    text: `Cette application collecte des données de localisation pour permettre la lecture audio à Genève même lorsque l'application est fermée ou non utilisée. Aucune information concernant l'utilisateur ou le suivi n'est envoyée à nos serveurs. 
    Veuillez vous assurer que votre téléphone autorise toujours cette fonction, sinon l'application ne pourra pas fonctionner correctement.`,
    cancel: 'Annuler',
    enable: 'Activer le suivi',
  },
  info: [
    {content: `Cliquez sur **On y va** et laissez activer le mode de suivi.

Lorsque vous entrez dans la zone d'une sculpture, la musique sera automatiquement diffusé

Si vous ne disposez pas d'une connexion Internet stable, veuillez temporairement **Télécharger les pistes**

Il est possible de **Télécharger la piste** séparée en cliquant sur chaque marqueur

Pour une meilleure expérience, utilisez vos écouteurs.

Pour supprimer la musique de votre smartphone, il suffit de désactiver le bouton **Télécharger les pistes** ou **Télécharger la piste**`, type: 'markdown'},
    {content: 'la musique n\'est pas chargée.', type: 'text', style: {color: 'blue'}},
    {content: 'la musique est chargée', type: 'text', style: {color: 'green'}},
    {content: 'téléchargement de la musique en cours', type: 'text', style: {color: 'orange'}},
    {content: 'musique en cours de lecture', type: 'text', style: {color: 'red'}},
    {content: 'Crédits', url: 'http://www.zonoff.net/belvederesonore/index.php/credits/', type: 'link'},
    {content: 'Politique de confidentialité', url: 'https://dispatchwork.info/peso/policy.html', type: 'link'}
  ],
}