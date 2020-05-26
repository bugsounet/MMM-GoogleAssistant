# Notifcations
`MMM-AssistantMk2` is required to `wakeup` to use. Many modules which can detect your trigger and can emit notification could become `awakener`.

Usually, by notification, this module will be awaken and be reacted to your action.

## Incoming notification
### **`ASSISTANT_ACTIVATE`**
With this notification, this module will send your order to Google Assistant Server then receive the response from Server.
For example, If a MagicMirror module would send this notification like below, `MMM-AssistantMk2` will say current time.
```js
// In some module;
this.sendNotification("ASSISTANT_ACTIVATE", {
  type: "TEXT",
  key: "What time is it now?"
})
```

|Payload field |Type |Example
|---|---|---
|type |TEXT | "TEXT"
|key |TEXT | "brief today"
|profile |TEXT | "default"
|lang |TEXT | "en-US"
|secretMode |BOOLEAN | false
|sayMode |BOOLEAN | false
|callback |FUNCTION | (res)=>{console.log(res)}

- `type` : **(required)** `"MIC"`, `"WAVEFILE"`, `"TEXT"` are available.
  - `MIC` : AMK2 will listen your vocal query through Mic at real time.
  - `WAVEFILE` : pre-recorded wave file could be used as query.
  - `TEXT` : Text string could be used as query.
- `key` : **(required conditionally)**
  - `type: "MIC"` : null.
  - `type: "WAVEFILE"` : path of wave file.
  - `type: "TEXT"` : query text.
- `profile` : **(optional)** profile Id to use. When omitted, current profile will be used.
- `lang` : **(optional)** language code to recognize, When omitted, current lang of profile account will be used.
- `secretMode` : **(optional)** If set as `true`, screen & audio response will not be played. It might be needed when you use `callback` on background.
- `sayMode` : **(optional)** If set as `true`, only audio response will be played.
- `callback` : **(optional)** If set, response will be delivered to this callback function so your module could use the response.
```js
this.sendNotification("ASSISTANT_ACTIVATE", {
    type: "TEXT",
    key: "How is the weather?",
    secretMode: true,
    callback: (response)=> {
      console.log(response)
      this.doSomething(response.screen)
    }
})
```

Another example :
```js
this.sendNotification("ASSISTANT_ACTIVATE", {type: "MIC"})
```
Whichever module can execute this, it could activate `MMM-AssistantMk2` as mic mode. Instead `MMM-Hotword`, you can make your own trigger module or can use any module existence (e.g. MMM-Button, MMM-Claps, ...)

### **`ASSISTANT_PROFILE`**
```js
this.sendNotification("ASSISTANT_PROFILE", "default")
```
You can change current profile with this notification. It could be used some profile-based module. (e.g. Facial recognition)

### **`ASSISTANT_COMMAND`**
```js
this.sendNotification("ASSISTANT_COMMAND", {
  command: "COMMAND_SOMETHING",
  param: ...
})
```
When you want to execute some registered `command` without activation of assistant, you can use this.


## Outgoing Notifications
Unlike ver 2.X, this version doesn't emit any special notifications (Of course, except the result of `notificationExec`)

Instead, you can use `plugin` to emit any notification that you need when it is needed. Read the docs about `plugin` more.

Example:
```js
commands: {
  "COMMAND_READY": {
    notificationExec: {
      notification: "AMK2_READY"
    }
  }
},
plugins: {
  onReady: "COMMAND_READY",
},
```
You can make to emit `AMK2_READY` notification when `MMM-AssistantMk2` is initialized and ready to work.
