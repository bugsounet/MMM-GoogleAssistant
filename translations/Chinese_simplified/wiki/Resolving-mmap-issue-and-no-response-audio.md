# What is the mmap issue ?

mmap issue mean that RPI have not enough memory for execute commands 

You can see this mesage in console:
```
mmap() failed: cannot allocate memory.
```
# Why i have this error ?

* maybe HTML5 bug ?
* It's happen if pulseaudio is installed, so pulseaudio bug ?
* We don't know really ...

# Do you solve this issue ?

There is 2 methods for solve this issue:
 * `useHTML5: false` and using `playProgram: "mpg321"` or `playProgram: "mpg123" in config.js file
 * Removing `pulseaudio` package, if you don't use bluetooth (you can try removing with `npm install`)

# Sometime i have audio response "cutted" or freezed in response screen
 * it's happen when you are using a non HTML5 version and pulseaudio using
 * pulseaudio is not recommanded with MagicMirror
 * if you don't use bluetooth, try removing pulseaudio package
