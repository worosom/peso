export default {
  tracking: 'Start',
  offline: 'Download Tracks',
  remove: 'Remove Track',
  download: 'Download Track',
  downloadAll : {
    title: 'Download size ~100 Megabytes',
    text: 'WiFi connection recommended.',
    cancel: 'Cancel',
    continue: 'Continue',
  },
  deleteAll : {
    title: 'Warning',
    text: 'You want to delete all tracks?',
    yes: 'Yes',
    no: 'No',
  },
  geolocationAlert : {
    title: 'Start Geolocation',
    text: `This app collects location data to enable audio playback in geneva even when the app is closed or not in use.
No user or tracking information is sent to our servers.
Please make sure that your phone always allows this, or else the app can not function properly.`,
    cancel: 'Cancel',
    enable: 'Enable tracking',
  },
  info: [
    {content: `Press **Start** and activate the tracking mode.

When walking in a sculpture's zone audio will be playing automatically.

If you don't have a stable internet connection please **Download Tracks** temporarily.

It is possible to Download each separate track by clicking on each marker.

Get a better experience, use your headphones.

To delete the music from your smartphone, simply deactivate the **Download Tracks** button or **Remove Track**.`, type: 'markdown'},
    {content: 'music is not loaded', type: 'text', style: {color: 'blue'}},
    {content: 'music is loaded', type: 'text', style: {color: 'green'}},
    {content: 'music download in progress', type: 'text', style: {color: 'orange'}},
    {content: 'music is playing or selected', type: 'text', style: {color: 'red'}},
    {content: 'Credits', url: 'http://www.zonoff.net/belvederesonore/index.php/credits/', type: 'link'},
    {content: 'Privacy Policy', url: 'https://dispatchwork.info/peso/policy.html', type: 'link'}
  ],
}
