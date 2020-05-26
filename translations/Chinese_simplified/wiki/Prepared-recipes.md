# Prepared recipes

We have prepared several recipes for your preferred modules.

## with-MMM-TelegramBot.js
 pre-configured commands:
 - /q : Query assisant `/q <question>` and assistant will respond you with telegram. (nothing was displayed on screen)
 - /query : Query assistant `/query <question>` and assisant wil respond to you with normal response on screen and audio
 - /say : Say with google TTS `/say <your text>`, required myMagicWord configuration
 - /demo : animated icon demo, required developer mode

## with-MMM-Hotword.js
If you want to use MMM-Hotword, this is the activator recipe (recommended)

## with-MMM-Youtube.js
 - Youtube links detector. If a link with youtube is detected, the video is displayed.
 - Youtube playlist detector
 - You can also use `youtube` keyword to force search
 - Vocal Control to stop video (modify pattern in your prefered language)
 - Mute volune on assistant query
 - **known bugs : on Fullscreen ui, video is stopped when assistant activate**

## with-MMM-Spotify.js
 You can now control MMM-Spotify with your voice
 - PLAY, STOP, PAUSE, NEXT, PREVIOUS, SHUFFLE, REPEAT are available
   - say `music play` for turn on music on Spotify
   - say `music stop` for stop music
 - SEARCH on Spotify
   - say `michael jackson on spotify` for playing a music of michael jackson
 - TRANSFER to ...
   - say `music transfert to raspotify` for transfering music to raspotify device (example)
 - VOLUME
   - say `spotify volume 50` to set the volume to 50%

> You can modify pattern activator to set commands in your language

> by editing `with-MMM-Spotify.js` file, example if you want to set spotify search in French
```js
 "SEARCH_SPOTIFY": {
      pattern: "recherche (.*) sur spotify",
      command: "SEARCH_SPOTIFY"
 },
```
> restart your mirror once the modification is complete

## with-MMM-Clap.js
> If you want to use MMM-Clap, this is the activator recipe

> MMM-Clap configuration is inside the file, just copy and paste it

## with-MMM-Xbox.js
> You can turn on / off xbox with your voice

> modify pattern in your prefered language

## with-MMM-Timetable.js
> force display desired timetable
** coming soon **
## with-MMM-News.js
> vocal control of MMM-News
** coming soon **

## Reboot-Restart-Shutdown.js
> this recipe allow vocal control for reboot, shutdown or restart (via pm2 restart) your mirror

> modify pattern in your prefered language