# transcriptionHooks

`transcription` is the sentence which Google Assistant have understood from your query spoken.

`transcriptionHook` is a kind of hooking to do something you want by intercepting normal conversation flow. So this is a tricky method. There could be `side-effect`, be careful to use.

## Structure
```js
transcriptionHooks: {
  "HOOK_1": {
    pattern: "test" // Simple static text or regular expression pattern. (e.g: "test ([a-z 0-9]+)$" )
    command: "COMMAND_1", // Describe command name to execute
  },
  "HOOK_2": {
    pattern: "turn (on|off) the radio",
    command: "COMMAND_TURN_RADIO"
  },
  ... // more hooks.
},
commands: {
  "COMMAND_1": { ... },
  "COMMAND_TURN_RADIO": { ... },
  ...
}
```
This example shows 2 transcriptionHooks. Very simple.
- `pattern` : text pattern to catch from transcription. You can use `regular expression` as a pattern instead of simple static text.
- `command` : name of command which should be executed when the pattern is matched with your transcription. Read `commands` more.

## Side effect
When `transcriptionHook` is triggered, normal response of Google Assistant will be ignored. Usually, this works without any issue. But under some case, it could make side-effect also.

For example, you might want to make a command `new event of calendar` to display some events of calendar module on your MagicMirror. But unfortunately, that phrase is a reserved phrase for Google Calendar on Google Assistant so Google Assistant will try to request title or date of event to create. Anyway this request will be ignored by activation of hooking, but the conversation status was kept so on the next time when you try to new query, Google Assistant might try to continue the conversation of event creation.

To avoid side effect, use `action` instead `transcriptionHook`. `action` is natural way to make custom command on Google Assistant SDK. However, `transcriptionHook` is quite easier than `action`.
