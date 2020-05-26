# 安装 v3.1.0-2

在 AMK2 v3版本, 我们为 RaspberryPi 以及其它 Linux 创建了自动安装器。

自动安装脚本将为魔镜，计划并安装需要的依赖，兼容的 gcc 版本以及rebuild `grpc` 模组。

它还可以检测你的音频设置是否正确并且能够生成适合你的配置内容。

当然，如果你愿意，你也可以手动安装。 (npm install将会问你一系列问题)

对于 OSX 机器/开发板，自动安装脚本还没有实现，必须进行手动安装。

## 1. 自动安装 (仅适用 RaspberryPi 和 Debian Linux)
```sh
cd <YOUR_MAGIC_MIRROR_DIRECTORY>

cd modules
git clone https://github.com/eouia/MMM-AssistantMk2

cd MMM-AssistantMk2
npm install

```

## 2. 手动安装

- 需要的依赖
```sh
sudo apt-get install libasound2-dev sox libsox-fmt-all
```
> 如果你在使用 OSX, 用 `brew` 代替 `apt`

```sh
brew install sox
```
- GCC 7 (GCC 8 在 Raspbian 上可能会出错)
```sh
sudo apt-get install gcc-7
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 10
sudo update-alternatives --config gcc
```
> 在OSX上你可能不需要这一步

- 模组安装
```sh
cd <YOUR_MAGIC_MIRROR_DIRECTORY>

cd modules
git clone https://github.com/eouia/MMM-AssistantMk2

cd MMM-AssistantMk2
npm install
```

然后，你需要为魔镜rebuild `grpc` 模组.
```sh
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild
```

## 3. 排障
控制台消息 : ```mmap() failed: cannot allocate memory.``` 并且没有播放音频提示音。
* 可通过修改config.js文件，使其含有 `useHTML5: false` 以及 `playProgram: "mpg321"` 
* 如果你不用蓝牙的话，移除 pulseaudio 包

我们正在修复这个issue
