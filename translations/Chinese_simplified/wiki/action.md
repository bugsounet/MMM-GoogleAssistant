# action (custom action for device)

`action` is more stable and natural than `transcriptionHook` to make custom commands. But difficult to make and manage. So I made helping features about it.


## Prepare
### Download gaction CLI
Download here : https://developers.google.com/actions/tools/gactions-cli
```sh
#example for RPI
cd ~/MagicMirror/modules/MMM-AssistantMk2/utility
wget https://dl.google.com/gactions/updates/bin/linux/arm/gactions
chmod +x gactions
```
> At this moment, Google haven't updated `linux-arm` gaction, so it might not work. Others are fine.


## Managing actions.
Sorry, somewhat complex.
First, `gaction CLI` should be got auth on first execution.
So, you need to these steps;
- Making `actions.json`
- Auth and Registering `actions.json`


### making `action_package.json`
> You can make action_package.json without MM execution by manual, in that case skip this step.

```js
customActionConfig: {
  autoMakeAction: true,
  autoUpdateAction: false, // in RPI, gaction CLI might have some trouble.(current version should be 2.2.4, but for linux-arm, Google haven't updated) so leave this as false in RPI. I don't know it is solved or not.
  actionLocale: "en-US", // At this moment, multi-languages are not supported, sorry. Someday I'll work.
},
recipes: ["actions.sample.js"],
```
After execution of MM, `action_package.json` would be created in `tmp` directory.
Then, quit MM.


### `action_package.json` sample
> This file would be created by module automatically, so don't have to care this file.

```json
{
  "manifest": {
    "displayName": "MAGICMIRROR CUSTOM DEVICE ACTION",
    "invocationName": "MAGICMIRROR CUSTOM DEVICE ACTION",
    "category": "PRODUCTIVITY"
  },
  "actions": [
    {
      "name": "AMK2.action.test",
      "availability": {
        "deviceClasses": [
          {
            "assistantSdkDevice": {}
          }
        ]
      },
      "intent": {
        "name": "AMK2.intent.test",
        "parameters": [
          {
            "name": "modulename",
            "type": "SchemaOrg_Text"
          }
        ],
        "trigger": {
          "queryPatterns": [
            "hide $SchemaOrg_Text:modulename",
            "remove $SchemaOrg_Text:modulename"
          ]
        }
      },
      "fulfillment": {
        "staticFulfillment": {
          "templatedResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": "Yes, sir! I'll hide $modulename"
                }
              },
              {
                "deviceExecution": {
                  "command": "COMMAND_TEST",
                  "params": {
                    "module": "$modulename"
                  }
                }
              }
            ]
          }
        }
      }
    },
    {
      "name": "AMK2.action.test3",
      "availability": {
        "deviceClasses": [
          {
            "assistantSdkDevice": {}
          }
        ]
      },
      "intent": {
        "name": "AMK2.intent.test3",
        "parameters": [],
        "trigger": {
          "queryPatterns": [
            "play yt"
          ]
        }
      },
      "fulfillment": {
        "staticFulfillment": {
          "templatedResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": "ok"
                }
              },
              {
                "deviceExecution": {
                  "command": "AMK2.command.test3",
                  "params": {}
                }
              }
            ]
          }
        }
      }
    }
  ],
  "types": []
}
```

### Auth `action_package.json` as first time.
Then, do this;
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2/utility

./gactions test --action_package ../tmp/action_package.json --project *YOUR_PROJECT_ID*
```

It will show some URL on terminal. Open that URL in any browser and allow(similar with login)

Then, your gaction will be registered.  (`custom action for device` cannot deployed publicly.) The lifetime would be 30 days.

### auto update
If you set `autoUpdateAction: true` and `autoMakeAction: true`, At every time of MM execution, this module will update your action automatically.

Or you can update it by manually with;
```sh
./gactions update --action_package ../tmp/action_package.json --project *YOUR_PROJECT_ID*
```

## structure of action recipe
> Your recipe will be converted to real `action_package.json` automatically by module.



### Simple
```json
actions: {
  "test1": {
    "patterns": [
      "abracadabra",
      "open sesame"
    ],
    "response": "ok",
  }
},
```
You made `"test1"` custom action now. When you say `abracadabra` or `open sesame`, Assistant will response `ok`. That's all. nothing happens.

In `patterns`, you can define which phrase could be registered as a custom action trigger. In this case, `abracadabra` and `open sesame` will be registered in Google Assistant Server for your device. When you say one of these phrases, Google Assistant regard it as a `custom action`.

In `response`, you can define the response message. It will be pronounced or displayed as a response of this custom action.

### predefined variable types and parameters
```js
actions: {
  "test2": {
    "parameters": [
      {
        "name": "modulename",
        "type": "SchemaOrg_Text"
      }
    ],
    "patterns": [
      "hide $SchemaOrg_Text:modulename",
      "remove $SchemaOrg_Text:modulename"
    ],
    
    "response": "Yes, sir! I'll hide $modulename",
    "commandName": "COMMAND_TEST2",
    "commandParams": {
      "module": "$modulename",
    },
  },
},

commands: {
  "COMMAND_TEST2": {
    ...
  }
}
```
When you say `hide [modulename]`, the response will be `Yes, sir! I'll hide [modulename]` and `command` **`COMMAND_TEST2`** will be triggered with payload `{module: "[modulename]"}`.

In `parameters`, you can define some variables like a wildcard. In this case, `SchemaOrg_Text` typed `modulename` is defined. `SchemaOrg_Text` is predefined-type. (https://developers.google.com/assistant/sdk/reference/custom-actions/query-pattern-types)

The proper type would be important for Google Assistant server to understand your query exactly. When you say `Petshop boys`, Assistant might not know whether it is the name of the band or a pet shop which has name as "boys". But if it is defined as `SchemaOrg_Person`, Assistant might be easier to understand the meaning.

In `patterns`, you can use the parameters defined. In the above example, **`hide $SchemaOrg_Text:modulename`** is that. With this, you can say "hide clock". `clock` will be saved as `modulename`.

You can use parameters in `response` again. In this case, when you say `"hide clock"`, the response will be `"Yes, sir! I'll hide **clock**"`.
> **note** : You cannot use `dynamic` fulfillment as parameters unlike usual `action for Google Assistant`. If you need more complex and dynamic response, you have to build your own `action for Google Assistant`. It is similar to this `custom action for device` but more complex. I will not mention it here, it is out of topic.

Of course, we don't want response only. `action` could have `command` also like other recipe elements of this module.  
`commandName` and `commandParams` would be that. In this example, `COMMAND_TEST2` command will be executed with params `{module: "clock"}`.


### custom types
```js
action: {
  "test3": {
    "patterns": [
      "switch $UpDown:updown"
    ],
    "response": "Oops!",
    "commandName": "COMMAND_TEST3"
    "commandParams": {
      "direction": "$updown"
    },
    "types":[
      {
        "name": "$UpDown",
        "entities": [
          {
            "key": "UP",
            "synonyms": [
              "back",
              "upward"
            ]
          },
          {
            "key": "DOWN",
            "synonyms": [
              "downward",
              "forward"
            ]
          },
        ]
      }
    ]
  }
},
```
You can also define your custom type. 

In this case, the custom type `UpDown` is defined.
This type could have two value of entities, `UP` and `DOWN` and each entity could have some synonyms.

When we activate this action by `switch up` or `switch back` or `switch upward`, `"UP"` will be delivered as parameters. For `DOWN`, it will be the same.

So when you say `"switch downward"`, `COMMAND_TEST3` command will be executed with params `{direction: "DOWN"}` and response will be `"Oops!"`. 

