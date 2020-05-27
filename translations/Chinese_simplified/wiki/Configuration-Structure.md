# 配置

## 基础结构
```js
{
  module: "MMM-AssistantMk2",
  position: "fullscreen_above",
  config: {
    assistantConfig: {
      latitude: 51.508530,
      longitude: -0.076132,
    },
    recipes: [
      "with-MMM-Hotword.js"
    ]
    ...
  },
},
```

## Configurable filed
> 你并不需要使用全部的配置内容，因为所有的容都被设置为了默认值。只需要选择你选哟的部分并写入你的 `config.`中。

|字段 | 类型 | 默认
|---|---|---
|debug | 布尔值 | false

当你打开 `debug` 模式，讲记录详细的日志内容，当你不想要日志时，把它设为 `false`


|字段 | 类型 | 默认
|---|---|---
|ui | 文本 | "Fullscreen"

我们预备了3种类型的UI. "Fullscreen", "Classic", "Classic2". 也可以制作自己的UI.(Inspect `ui` directory)

_Notes_:
 * 只有 `Fullscreen` ui可使用 `fullscreen_above` 模组位置.
 * Fullscreen ui 中，没有Google Assistant图标。Google Assistant屏幕只会在激活时（对话时）显示
 * 对于其它ui，最好的位置是在 `top_left`

|字段 (- 子字段) | 类型 | 默认
|---|---|---
|assistantConfig |  对象 | { ... }
|- latitude | 数值 |51.508530
|- longitude| 数值 |-0.076132
|- credentialPath | 文本 | "credentials.json"
|- projectId | 文本 | ""
|- modelId | 文本 |""
|- instanceId | 文本 | ""

- `latitude` & `longitude` : 你的魔镜所在的位置
- `credentialPath` : 你不需要更改这条内容;
- `projectId`, `modelId`, `instanceId` : 除非你需要使用 `custom action` 或者注册设备到Google Home网络，你或许不需要这些值
译者注：当然你可以用开源的Home Assistant代替Google Home，开源的软件它不香么？

- 举个栗子
```js
assistantConfig: {
    latitude: 51.508530,
    longitude: -0.076132,
},
```
把经纬度改到你的真实位置。

这个 [网站](https://latitudelongitude.org/) 可以帮助你确定经纬度
译者注：国内玩家百度地图就完事了，单词看清楚，别把经纬写反了！。

|字段 (- 子字段) | 类型 | 默认
|---|---|---
|responseConfig | 对象 | { ... }
|- useHTML5 |布尔值 |true
|- useScreenOutput |布尔值 |true
|- useAudioOutput |布尔值 |true
|- useChime |布尔值 |true
|- timer |数值 (毫秒) |5000
|- myMagicWord|布尔值|false
|- delay|数值 (秒) |0.5
|- playProgram |字符串|mpg321
|- useStaticIcons|布尔值 or 字符串| false
|- chime|对象| { ... }
- `useHTML5` : 使用HTML5音频输出
- `useScreenOutput` & `useAudioOutput` : 控制响应类型，但是最好把它们两都写成 `true`
- `useChime` : 如果你不想要状态提示音，把它设置为 `false`.
- `timer` : 反应持续时间 (自完成算起). 在此毫秒后，响应窗口将隐藏，模块将返回待机状态。
- `myMagicWord` : 对于指定命令的自然 TTS 回应 (详见 myMagicWord 部分 -- Under developement)
- `delay` : 助手激活的计时器。在这个延迟后激活助手 (播放一声提示音“嘀”) 然后就可以讲话了 (Generaly for mic close delay issue) 译者注：如果配置正确，你并不需要等待，可以直接讲话。
- `playProgram` : 如果你不想用HTML5音频输出，请指定程序(mpg321,...
- `useStaticIcons` : false - 动态图标， 'standby' - 静态图标仅用于待机状态, true - 全部状态下启用静态图标
- `chime`: 个性化提示音，包括错误、继续、打开、关闭的提示音
```js
responseConfig: {
    timer : 3000
    chime: {
      beep: "beep.mp3",
      error: "error.mp3",
      continue: "continue.mp3",
      open: "Google_beep_open.mp3",
      close: "Google_beep_close.mp3",
    },
},
```
|字段 (- 子字段) | 类型 | 默认
|---|---|---
|micConfig | 对象 | { ... }
|- recorder |文本 | "arecord"
|- device |文本 | null

- `recorder` : 可以使用`"sox"`, `"rec"`, `"arecord"`三个程序。一般在Raspbian上使用 `"arecord"`
- `device` : 录音设备(麦克风) 在当前环境的名字. (例如 `"plughw:1"`) 自己寻找合适的设备名称. (在 Raspberry Pi 上 `arecord -l` 可以列出设备)

注释: 如果你使用npm install开启了自动安装它将生成 `micConfig {}` 的配置部分。
译者注：自动安装时普通的SSH程序连接，无法收到提示音，建议直接使用树莓派安装。

正常情况下，只有上面的2个字段对于一般使用时必须的，如果你需要更多的配置内容，你可以看看下面这些值 (小心地修改它，你不理解的内容就别乱动)

```js
sampleRate            : 16000  // 音频采样率
channels              : 1      // 频道的数字
threshold             : 0.5    // 静音阈值 (仅录音)
endOnSilence          : false  // 静默时自动结束 (如果支持的话)
thresholdStart        : null   // 开始录制的静音阈值，覆盖阈值 (仅录音)
thresholdEnd          : null   // 达到静音阈值结束录制，覆盖阈值 (仅录音)
silence               : '1.0'  // 结束前的静默秒数
recorder              : 'sox'  // 默认设置为 'sox'
device                : null   // 录音设备 (e.g.: 'plughw:1')
audioType             : 'wav'  // 录音文件格式
verbose               : false  // 冗余录音设备
```

例子
```js
micConfig: {
  device: "plughw:1",
},
```

|字段 | 类型 | 默认
|---|---|---
|defaultProfile |文本 | "default"
|profiles |对象 | { ... }


```js
defaultProfile: "default",
profiles: {
  "default": {
    profileFile: "default.json",
    lang: "en-US"
  }
},
```
- `defaultProfile` : 用于默认识别的配置文件 ID
- `profiles` : 您可以同时保留多个配置文件。当然，您可以根据条件更改配置文件。 (例如通过人脸识别更换配置文件)

- 每个配置文件都有这个结构
```js
  "PROFILE_ID": {
    profileFile: "USER_TOKEN_JSON",
    lang: "en-US",
  }
```
- 现在支持的语言;
```
de-DE, en-AU, en-CA, en-GB, en-IN, en-US, fr-CA,
fr-FR, it-IT, ja-JP, es-ES, es-MX, ko-KR, pt-BR
```
[谷歌支持的语言](https://developers.google.com/assistant/sdk/reference/rpc/languages)
译者注：其实对于标准的简体中文（zh-CN）它也是支持的

对于其它语言, 部分语言不能保证全部识别。




|字段 | 类型 | 默认
|---|---|---
|recipes |文本列表 | []

- `recipes` : recipes是模块的扩展文件。你可以用这个字段加载你需要的recipes。
```js
recipes: [
    "with-MMM-Hotword.js", "with-MMM-TelegramBot.js",
    "hide_when_no_use.js"
],
```
你可以按照你的需要制作你的recipe。请继续向后阅读并查看 `recipes` 目录。


|字段 | 类型 | 默认
|---|---|---
|transcriptionHooks |对象 | { ... }
|actions |对象 | { ... }
|commands |对象 | { ... }
|plugins |对象 | { ... }
|responseHooks |对象 | { ... }

- 每一个 `recipe` 会包含这些字段 (except addons)。但是你可以在这里修改内容而不使用recipe. (为了更方便地管理我推荐你使用 `recipe` 文件)
- 对于这些字段 (except addons), 请阅读 [wiki:recipes](https://github.com/eouia/MMM-AssistantMk2/wiki/Recipes).

|字段 (- 子字段) | 类型 | 默认
|---|---|---
|customActionConfig | 对象 | { ... }
|- autoMakeAction |布尔值 |false
|- autoUpdateAction |布尔值 |false
|- actionLocale |文本 | "en-US"

> 这个 `customActionConfig` 是个实验性功能。慎重使用它。

- `autoMakeAction` : 这个选项会转换你的 `actions` 为 `action.json` 将其自动作为Google Assistant SDK的自定义操作源
- `autoUpdateAction` : 此选项会将转换后的操作更新为Google Assitant服务器。个人地动作将被注册为 `test mode`，所以需要定期更新。这个选项会自动更新。 译者注：个人用户，使用自己搭建并连接到Google Home服务的软件时，只能作为测试模式，每隔一段时间会重置，所以你需要定期更新。
- `actionLocale` : 设置你的本地化选项。目前我还没有提供多语言的支持 (将来会有的)

|字段 | 类型 | 默认
|---|---|---
|addons |布尔值| false

对于 AMk2 的 addons 的个性化配置请阅读 [wiki:addons](https://github.com/bugsounet/addons)

激活 [Assistant2Display](https://github.com/bugsounet/MMM-Assistant2Display) build-in addon

## 和插件 `MMM-Hotword` 一起使用
译者注：说白了就是个性化唤醒词
```js
{
  module: "MMM-Hotword",
  position: "top_left",
  config: {
    recipes: ["with-AMk2v3_smart-mirror.js"],
    ... // your other configuration
  }
},
{
  module: "MMM-AssistantMk2",
  position: "top_left",
  config: {
    recipes: ["with-MMM-Hotword.js"],
    ... // your other configuration
  }  
},
```
这会使 `smart mirror` 中的 `MMM-Hotword` 插件作为 `MMM-AssistantMk2` 的触发因素。
额外的，这个新的版本会使 `seamless query` 成文可能。这意味着你不需要等待 AMK2 响应就可以继续说下去。 `Smart mirror! (waiting a beep) What time is it?` and `Smart mirror, what time is it?` 两者都可以使用，就像真的 Google Home 设备一样 So cool.

译者注：作者这里大概率指的是那个Google推出的智能音箱。
