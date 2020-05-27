# Recipes

`MMM-AssistantMk2` is basically implementation of Google Assistant SDK, but not alternative or equivalent of Real Google Home device. This module is developed for the purpose of controlling MagicMirror.

To control MagicMirror or Device(Raspberry PI, etc.), this module could have extended feature which is not supported by SDK itself. We call it as `recipe`. Each recipe would be mixture of `transcriptionHook`, `action`, `plugin`, `responseHook` and `command`.

- `transcriptionHook` : Hooking some pattern from your speech.
- `action` : Custom action for Google Assistant.
- `plugin` : Hooking procedure of this module on specific point.
- `responseHook` : Hooking some pattern from response (screen output) of Google Assistant
- `command` : Execution as a result of `transcriptionHook`, `action`, `plugin`, `responseHook`

## Recipe file
**`recipes/recipe.template.js`**
```js
var recipe = {
  transcriptionHooks: {
    // Describe your transcriptionHook here.
  },
  actions: {
    // Describe your custom Action here.
  },
  plugins: {
    // Describe your plugin here.
  },
  responseHooks: {
    // Describe your responseHook here.
  },
  commands: {
    // Describe your command here.
  },
}
exports.recipe = recipe // Don't remove this line.
```
Not all parts have to be needed. If you need only `transcriptionHooks` and `commands` be needed, Write just them.

Each recipe file should locate in `recipes` directory.

Then, you can configure your config.js
```js
recipes: [
  "some_recipe.js", "other_recipe.js", ...
],
```

## Prepared recipes
- `recipe.template.js` : template of recipe file
- `action.sample.js` : examples of action
- `hide_and_show_all_modules.js` : to show/hide modules with transcription `show all` and `hide all`
- `hide_when_no_use.js` : To hide MMM-AssistantMk2 after some time passed from last using
- `Reboot-Restart-Shutdown.js` : Vocal control for reboot, restart or shutdown your mirror
- `with-MMM-Hotword.js` : Setup to use `MMM-Hotword` as activator
- `with-MMM-Youtube.js` : Commands for controlling `MMM-Youtube`
- `with-MMM-Spotify.js` : Commands for controlling `MMM-Spotify` with your voice
- `with-MMM-TelegramBot.js` : Commands for controlling AMk2 with TelegramBot
- ...

See Prepared recipes wiki

Feel free to make PR to share your recipe with others.

## note
- You can describe each part directly into `config.js` instead of using recipe file. But recipe is better to manage. 
