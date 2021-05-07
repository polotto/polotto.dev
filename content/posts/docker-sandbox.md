---
title: "Docker sandbox for application behavior analysis"
date: 2021-05-07T10:00:02-03:00
draft: false
tags: ["docker", "java"]
---

Recently, I faced the problem: analyse the network requests and disk access of a JAR package.

I tried to search for some ready to use solution, but I couldn't find anything more simple than to run a Docker container. So, my first thought was: set up a container with a network and file monitor and then start the JAR inside. After some problems and lack of tutorials I found a good solution, that's not only solved my problem but can be used to solve other problems with the same nature: monitor the behavior of some application inside a container. In this article, I will share my solution.

## First step: docker container configuration

Here we will make a shell script file to create the docker container for us. Some people can think: Why didn't you use docker images? My answer is: flexibility. With docker manually created with a shell script file you can modify the container without creating and deleting the container image every time you need to modify something. The sandbox creation implies a lot of trial and error to get it done.
So, create a file called `sandbox.sh`and add the following content:

```bash
#!/bin/bash

CONTAINERNAME="java-sandbox" # container name
LMAP=$(pwd) # local volume to be mapped
CVMAP="/root" # path inside of container to be mapped
LOGF="~/logs"
LOGIGNORE="/root/logs/"
LOGIN="$LOGF/inotifywait.log"
LOGTLS="$LOGF/ssl-key.log"
LOGTCP="$LOGF/tcpdump.pcap"

echo "a - start a container;"
echo "c - connect;"
echo "s - stop"
read -p "Option: " OPT

case $OPT in
	a)
docker run \
			--rm \
			--name $CONTAINERNAME \
			-v "$LMAP":"$CVMAP" \
			-d -t -i \
			ubuntu 

		echo "-----------------> installing components <-----------------" 
		echo "-----------------> update..."
		docker exec $CONTAINERNAME bash -c "apt-get update > /dev/null"

		echo "-----------------> ping..."
		docker exec $CONTAINERNAME bash -c "apt-get -y install iputils-ping > /dev/null"

		echo "-----------------> net-tool (ifconfig, etc)..."
		docker exec $CONTAINERNAME bash -c "apt-get -y install net-tools > /dev/null"

		echo "-----------------> tcpdump ..."
		docker exec $CONTAINERNAME bash -c "apt-get -y install tcpdump > /dev/null"

		echo "-----------------> inotifywait ..."
		docker exec $CONTAINERNAME bash -c "apt-get -y install inotify-tools > /dev/null"

		echo "-----------------> curl ..."
		docker exec $CONTAINERNAME bash -c "apt-get -y install curl > /dev/null"

		echo "-----------------> java..."
		docker exec $CONTAINERNAME bash -c "apt-get -y install openjdk-11-jdk > /dev/null"

		# echo "-----------------> wget ..."
		# docker exec $CONTAINERNAME bash -c "apt-get -y install wget"

		# echo "-----------------> GnuTLS ..."
		# docker exec $CONTAINERNAME bash -c "apt-get -y install gnutls-bin"
		
		echo "-----------------> setting env to sniff <-----------------"
		echo "-----------------> logs dir"
		docker exec $CONTAINERNAME bash -c "mkdir "$LOGF""

		echo "-----------------> inotifywait log"
		docker exec $CONTAINERNAME bash -c "inotifywait -o "$LOGIN" -d -r @"$LOGIGNORE"  -m /"

		echo "-----------------> SSLKEYLOGFILE"
		docker exec $CONTAINERNAME bash -c "echo export SSLKEYLOGFILE="$LOGTLS" > ~/.bashrc && source ~/.bashrc"

		echo "-----------------> tcpdump pcap log"
		docker exec $CONTAINERNAME bash -c "tcpdump -i eth0 -w "$LOGTCP" &"

		# echo export SSLKEYLOGFILE=~/.ssl-key.log > ~/.bashrc
		# tcpdump -i eth0 -w mycap.pcap
		# echo $SSLKEYLOGFILE
		# SSLKEYLOGFILE=~/.ssl-keys.log curl https://www.google.com

		echo "-----------------> starting bash..."
		docker exec -it $CONTAINERNAME bash
		;;
	c)
		echo "-----------------> starting bash..."
		docker exec -it $CONTAINERNAME bash
		;;
	s)
		echo "-----------------> killing tcpdump"
		docker exec $CONTAINERNAME bash -c "pkill tcpdump"

		echo "-----------------> killing inotifywait"
		docker exec $CONTAINERNAME bash -c "pkill inotifywait"

		echo "-----------------> stopping container..."
		docker container stop $CONTAINERNAME
		# echo "-----------------> removing container..."
		# docker container rm $CONTAINERNAME
		;;
esac
```

The main points of the script that need to be configured:

* `CONTAINERNAME`: define the name of the container that will be created;
* `LMAP`: the local volume that will store our JAR file and the generated logs;
* `CVMAP`: container folder that will mapped, by default, the root folder;
* `LOGF`: log folder to store all logs generated for us by;
* `LOGIGNORE`: folder that will ignored by the disk monitor, usually, the folder containing the logs generated for us;
* `LOGIN`: file that will log all the changes made in disk. The inotifywait will generate those logs for us;
* `LOGTLS`: file that will log all TLS keys that will be necessary to decrypt HTTPS traffic inside Wireshark;
* `LOGTCP`: file that will log all TCP communication made by our container. The tcpdump will generate those logs for us;

Now, change the script execution permission with `chmod +x sandbox.sh` and the shell script will do the magic for us. After execution, the script will open the container in the interactive mode, just navigate to our JAR file and execute it. All the TCP connections and files changes will be logged for us.
Another important observation is: you can run whatever you want and log the activity.

Happy hacking!
