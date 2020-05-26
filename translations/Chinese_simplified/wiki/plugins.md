# plugins
`plugin` is some kind of `monkey patch` for external recipe or module to extend MMM-AssistantMk2's program logic.

## example
You can do something on specific phase of MMM-AssistantMk2 module.
```js
plugins: {
  onReady: "DO_SOMETHING",
  onBeforeActivated: "DO_ANOTHERTHING"
},

commands: {
  "DO_SOMETHING": {
    functionExec: ()=> {
      console.log("This will be executed when `onReady` phase.")
    }
  },
  "DO_ANOTHERTHING": {
    moduleExec: {
      module: ["MMM-Another"],
      exec: (payload)=> {
        console.log("MMM-AssistantMk2 is receiving ASSISTANT_ACTIVATED with payload", payload)
      }
    }
  }
}

```


## plugins locations
```
onReady: ()=>{}
onBeforeAudioResponse: ()=>{}
onAfterAudioResponse: ()=>{}
onBeforeScreenResponse: ()=>{}
onAfterScreenResponse: ()=>{}
onBeforeInactivated: ()=>{}
onAfterInactivated: ()=>{}
onBeforeActivated: (payload)=>{}
onAfterActivated: (payload)=>{}
onError: (text)=>{} // text of error
onBeforeNotificationReceived: (noti, payload)=>{}
onAfterNotificationReceived: (noti, payload)=>{}
onBeforeSocketNotificationReceived: (noti, payload)=>{}
onAfterSocketNotificationReceived: (noti, payload)=>{}
```
More points would be added in future version. If you need more locations, feel free to suggest.
