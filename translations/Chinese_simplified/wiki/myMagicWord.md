# myMagicWord (beta)

AssistantMk2 v3 includes text-to-speech functionality.

This allows for natural responses during personalized actions.

myMagicWord is available on 6 languages only: English, French, German, Japanese, Italien and Spanish


# Installation

To use this feature, you must have an [IFTTT](https://www.ifttt.com) account.

IFTTT is free and allows communication with google assistant servers (gateway).

It allows you to create personalized actions.

Your IFTTT account should be linked to your google account.

To make installation easy we have created an installation link according to your language.

You just have to authorize the execution of the IFTTT script on google assistant.

## Language Setup

Install only the configuration file for your language

* [English](https://ifttt.com/applets/pvUHDYw2-assistantmk2-v3-mymagicword-en-version)
* [French](https://ifttt.com/applets/knkqfH92-assistantmk2-v3-mymagicword-fr-version)
* [German](https://ifttt.com/applets/fi34qtvE-assistantmk2-v3-mymagicword-de-version)
* [Japanese](https://ifttt.com/applets/H9yDraz7-assistantmk2-v3-mymagicword-jp-version)
* [Italien](https://ifttt.com/applets/vjNF2CE7-assistantmk2-v3-mymagicword-it-version)
* [Spanish](https://ifttt.com/applets/j6WqB7XT-assistantmk2-v3-mymagicword-es-es-version)

and connect it by click on `connect`! (autorise IFTTT to use google and google assistant)

If installation is sucessfull, you can see `Connected`

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/connect.jpg)

##  Apply the changes on AssistantMk2

In the conguration file of MMM-AssistantMk2 (`config.js`)

Change the line : `myMagicWord: false,`

to: `myMagicWord: true,`

don't forget `,` at the last part

## Let's Test it !

Restart your Magic Mirror

You can test your MagicWord with `MMM-TelegramBot` with the command `/say`

For recipes, we make an exemple with MagicWord :

edit [test_with_soundExec.js](https://github.com/eouia/MMM-AssistantMk2/blob/3-dev/recipes/test_with_soundExec.js "test_with_soundExec.js") in your recipe directory

define your proper text in your language `say: "<text to speech>"` 

Now to set it into your config.js file

replace : `recipes: [],`

by `recipes: ["test_with_soundExec.js"]`

Restart your `MagicMirror`

Activate the assistant and say `test`

AMk2 will response your defined proper text !

## Create your recipe

[Read the recipe wiki (soundExec)](https://github.com/eouia/MMM-AssistantMk2/wiki/commands#soundexec-command)

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/resources/AMk2_Small.png)

 *Bugsounet*
