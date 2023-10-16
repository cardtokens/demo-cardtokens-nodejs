# demo-cardtokens-nodejs

## Introduction
This example shows how to create a token towards the Cardtokens API, create a cryptogram, get status and delete the Token. 

You can run this code directly using a predefined apikey, merchantid and certificate. You can also get a FREE test account and inject with your own apikey, merchantid and certificate. Just visit https://www.cardtokens.io

## Steps to use this example code on Ubuntu

### Clone repo
```bash
git clone https://github.com/cardtokens/demo-cardtokens-nodejs.git
```

### Navigate to folder locally
```bash
cd demo-cardtokens-nodejs
```

### Install node
#### Start with update
```bash
sudo apt update
sudo apt install nodejs
sudo apt install npm
node -v
npm -v
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Run the program
```bash
node cardtokens.js
```

