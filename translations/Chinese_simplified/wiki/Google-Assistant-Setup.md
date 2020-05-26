# 设置谷歌助手

## 获取身份验证和凭据
1. 在 [Actions Console](https://console.actions.google.com/) 建立或打开一个项目（project）
2. 创建后,在 [Cloud Platform Console](https://console.cloud.google.com/) 中，为你的项目开启 `Google Assistant API`
3. 返回到 Actions Console 按照下面的指示以 [注册一个设备模型](https://developers.google.com/assistant/sdk/guides/service/python/embed/register-device)

(如果你找不到 `Device registration` 菜单，你可以使用这个链接 https://console.actions.google.com/u/[0]/project/[yourprojectId]/deviceregistration/) (更改 [] 为你的项目名) 或者 [手动注册](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual))

4. 在注册的过程中(第二步)，你可以下载你的 `credentials.json` 用于身份验证。并确保它保存在 `MMM-AssistantMk2` 目录中。
 - 或者，你可以从 [Cloud Platform Console](https://console.cloud.google.com/) (Your Project > APIs & Services > Credentials)找到你的凭据。
5. 在你的 SBC（不能使用SSH，直接操作树莓派，详见下方的b） 中，你可以运行身份验证工具以验证身份。
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
node auth_and_test.js
```
   a. 如果你碰到了有关node版本的错误， 执行 `npm rebuild` 然后再试一次。

   b. 第一次执行过程中，这个脚本会尝试打开浏览器以获得个人用户使用Assistant的许可 (所以，不要使用SSH，直接操作树莓派)

   c. 确认之后, 你的Asistant许可将会显示在浏览器中，例如 (`4/ABCD1234XXXXX....`) 把那串代码到到你的终端里 (`Paste your code:`) 的提示部分 译者注：国内用户可以配置本地HTTP代理，或路由器的透明代理，来给树莓派一个完全身处墙外的网络环境。

   d. 成功后, 将会立即显示 `Type your request` 。 尝试输入一些文字以测试assistant. (例如; `Hello`, `How is the weather today?`)

   e. 现在，在 `MMM-AssistantMk2` 目录中，你可以找到 `token.json` 。 把他移到 `profiles` 目录下，并重命名为 `default.json`。This will be used in module as `default` profile。

 ```sh
 mv token.json ./profiles/default.json
 ```
  f. 如果你想要制作更多的描述文件（profiles）(为你的家人??)，重复步骤5。然后移动 `token.json` 把它挪到 profiles 的目录下，并使用一个新的名字，别忘了还要设置配置文件。
```sh
mv token.json ./profiles/mom.json
```


## 设置 `OAuth Consent Screen`
有时，你可能碰到与 `OAuth Consent Screen missing` 相关的问题
在这种情况下打开 [Cloud Platform Console](https://console.cloud.google.com/) 然后依次点击 `APIs & Services > OAuth Consent Screen`。首先，会看到问题：which user type would use your project，选择 `External`后这个页面将会跳转到 `OAuth consent screen`，保持unverified状态。在开发阶段，这就足够了。


## 获取 `deviceModelId` 和 `deviceInstanceId`
> 如果你不是一个经验丰富的开发者或者不需要 `gactions` 里的特性，跳过这一部分。

译者注：大佬级玩家需要这一步，讲道理你可以看懂英文，我就不翻译了。

If you want not only pure Assistant embeding but also customized gactions for device, you might need to get `deviceModelId` and `deviceInstanceId`. To help understanding, **deviceModel** is something like `Volkswagen Golf` or `MagicMirror` and **deviceInstance** is something like `mom's car` or `mirror in living room`.

### For `deviceModelId`
You can get `deviceModelId` as a result of previous [register a device model](https://developers.google.com/assistant/sdk/guides/service/python/embed/register-device) step. In `Device registration` menu in `Actions Console`, you can find it.

### For `deviceInstanceId`
You need additional `google-assistant-sdk` library. See [
Manually Register a Device with the REST API](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual#get-access-token) page.
