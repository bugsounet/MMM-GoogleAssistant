## Register your Mirror as Google Assistant related device
You might need to register your mirror as device of Google Home/Assistant App. (For more control or gAction using)

Follow this.
```
cd ~

sudo apt-get update

sudo apt-get install portaudio19-dev libffi-dev libssl-dev libmpg123-dev

sudo apt-get install python3-dev python3-venv

python3 -m venv env

env/bin/python -m pip install --upgrade pip setuptools wheel

source env/bin/activate

python -m pip install --upgrade google-auth-oauthlib[tool]

cp MagicMirror/modules/MMM-AssistantMk2/credentials.json .
```
Then,
```
google-oauthlib-tool \
  --scope https://www.googleapis.com/auth/assistant-sdk-prototype \
  --headless --client-secrets credentials.json
```

This will display some URL. Copy it and paste it into browser. You will be asked some confirmation, then, you can get some CODE. Copy it and paste into terminal then enter.
Then, You will get some code similar this;

```
{
   "scopes": ["https://www.googleapis.com/auth/assistant-sdk-prototype"],
   "token_uri": "https://accounts.google.com/o/oauth2/token",
   "token": "ya29.GlujBLa_kuXZ5GnGBPBe_A6NpczLcpOtglEC0wHVORnmEhHETzlSW",
   "client_id": "795595571889-6iesr9a3nkmnipbdfnqi6gehiklm2m28.apps.googleusercontent.com",
   "client_secret": "Un8_TNFnb55555auSAGasvAg",
   "refresh_token": "1/4ZMBhTR3bTYWVEMatYWLOxW755555hlQXZI5uC02F2U"
 }
```
Copy the token (exclude quotation mark) Then, type in the shell like this.
```
ACCESSTOKEN=<Paste your copied token here>
```
> Don't add `<` and `>`. So, it looks like `ACCESSTOKEN=ya29.GlujBLa_ku...`

Now create “deviceInstance.json” (sample is on your MMM-AssistantMk2 directory)
```
nano deviceInstance.json
```
and write this and save.
```
{
    "id": "my_mirror_001",
    "model_id": "YOUR_MODEL_ID",
    "nickname": "My 1st Mirror",
    "client_type": "SDK_SERVICE"
}
```
`id` is `instanceId`, so you can name it as your wish like `MY_2ND_MIRROR` or `RPIONBEDROOM` or anything else.

`YOUR_MODEL_ID` could be got from your Google Project console. (You've already got this and `YOUR_PROJECT_ID` when your project was created.)
Then,
```sh
curl -s -X POST -H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESSTOKEN" -d @deviceInstance.json \
https://embeddedassistant.googleapis.com/v1alpha2/projects/YOUR_PROJECT_ID/devices/
```
 If success, your contents of deviceInstanc.json will be displayed again.
 Now, `my_mirror_001` is your deviceInstanceId

Then, modify configuration of MMM-AssistantMk2, and rerun.
```js
deviceModelId: "YOUR_MODEL_ID",
deviceInstanceId: "my_mirror_001",
```

Now you can see your mirror on Google Home App in your phone.