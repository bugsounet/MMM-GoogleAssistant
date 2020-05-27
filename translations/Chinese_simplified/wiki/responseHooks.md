# responseHook

`response` means the answer from Google Assistant about your previous query.

Usually, response might have much information. `responseHook` is a kind of hooking to execute command when some response data would match with some patterns.

Response of Assistant usually has `links`, `text`, `photos`. (And there be more information, but probably you don't need them.)

For example;

When you say "Youtube Michael Jackson Thriller", the response would have some data like these;
```js
{
  links: [ 'https://m.youtube.com/watch?v=4V90AmXnguw' ],
  text: '"Michael Jackson - Thriller (Shortened Version) - YouTube" ( m.youtube.com - https://m.youtube.com/watch?v=4V90AmXnguw )',
  photos: [],
  ...
}
```

So you can hook this response like this;
```js
responseHooks: {
  "FOUND_YOUTUBE": {
    where: "links",
    pattern: "https:\/\/m\.youtube\.com\/watch\\?v=(.+)$",
    command: "PLAY_YOUTUBE"
  }
},
commands: {
  "PLAY_YOUTUBE": {
    moduleExec:{
      module: "MMM-AssistantMk2",
      exec: (module, param, from)=>{
        module.sendNotification("YOUTUBE_LOAD", {type:"id", id:param[1]}) // MMM-Youtube is needed to work this.
      }
    }
  },
}
```

## structure
```js
responseHooks: {
  YOUR_RESPONSE_HOOK_NAME: {
    where: "links", // `links`, `text`, `photos` be available
    pattern: "https:\/\/m\.youtube\.com\/watch\\?v=(.+)$", // regexp pattern string to catch
    command: "PLAY_YOUTUBE" // Name of command which be executed when hooked.
  }
},

```
- `where` : Where to check the pattern. `links`, `text`, `photos` will be available. `links` and `photos` would be array.  

As the `param` of command, result of **regExp.exec()** will be transferred.
