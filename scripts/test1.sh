#!/bin/bash
clear
echo "Starting the script"
echo "Hi, $USER!"
COLOR="GREEN"
SIZE="BIG"
echo "HERE's a $SIZE $COLOR baloon!"

echo "Here are the system's connected users:"
w

echo "The current home directory is $HOME"  #print current home directory
echo "Using the $TERM shell" #print the current terminal
echo "Runlevel 3 services are:"  #list runlevel 3 services
ls /etc/rc3.d/S*|more
