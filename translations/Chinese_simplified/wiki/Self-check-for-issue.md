When you have a problem with using this module, Before posting an issue, Check these first by yourself.

1. Remove all other modules from `config.js` except these modules
   - clock
   - alert
   - MMM-AssistantMk2
   - (MMM-Hotword) : If you are using.

2. Execute MM with developer tools in real-time.
   - Stop `pm2` if you are using. (`pm2 stop all`)
   - Execute `npm start dev` in MagicMirror directory
   - It will open MagicMirror with a developer panel on MM screen. See the `console` tab. You can get front-end console log there. Check whether any suspicious error or message on it.
   - At same time, in your terminal shell, the backend log will be stacked. You can change the window focus by `Ctrl+tab` or something similar(depends on your device/os)

3. If you are using `MMM-Hotword`;
   - First, confirm `MMM-Hotword` working without `MMM-AssistantMk2`. To check this; remove `MMM-AssistantMk2` also from config.js.
   - Look whether `MMM-Hotword` can detect your hotword. You can check this in your backend-log.


4. When you report the issue; Please leave these information.
   - current config.js (the result of 1)
   - frontend log and backend log (the result of 2)
   - Your H/W device, OS, node version also.