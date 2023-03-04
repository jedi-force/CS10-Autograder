#!/usr/bin/env bash

apt-get update

apt-get install sudo 

sudo apt-get install -y wget
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get -f -y install

# Install current Nodejs (v18.x at the time of making).
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt-get install -y nodejs

# Specify directory so npm doesn't error.
cd /autograder
 
npm i puppeteer