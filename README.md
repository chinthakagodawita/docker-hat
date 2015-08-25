# docker-hat
A hat for your Docker!

This is a set of helper commands to run and manage Docker containers on OS X.

## Requirements
* [Homebrew](http://brew.sh/)
* [VirtualBox](https://www.virtualbox.org/)
* [Node.js](https://nodejs.org) (>= 0.12)
    - Automatically installed if install via Homebrew!

## Installation

Super simple with Homebrew, just run the below and you'll be up-and-running in no time:

```bash
brew tap chinthakagodawita/homebrew-dh
brew update
brew install docker-hat
```

## Commands

All commands are simply sub-commands of the `dh` binary. A full list is below (examples coming soon!):

### dh init

Sets up Docker to run on your Mac. This goes off and sets up (via dinghy) the following things:

* Docker host VM (_boot2docker_): To run your containers in, `docker-machine` is used to instrument this
* NFS server (_unfsd_): So that files can be shared to the container without being bottlenecked by VirtualBox's shared folder implementation
* DNS server (_dnsmasq_): Creates a wildcard DNS on `*.docker` which automatically maps to the Docker host
* HTTP proxy (via _nginx_): Allows multiple containers to share the same port

**Usage**

```bash
dh init
```

### dh soe

Starts up a nifty Standard Operating Environment for building various applications in. Currently only supports PHP (with special focus on Drupal & Wordpress) but more coming soon!

See [docker-containers](https://github.com/chinthakagodawita/docker-containers) for a full list and Dockerfiles.

#### Subcommands
##### dh soe start

Start up a new container using one of the special pre-built SOE images.

**Usage**

```bash
dh soe start <container-name>
```

##### dh soe stop

Stop an already-running container.

**Usage**

```bash
dh soe stop <container-name>
```

##### dh soe restart

Restart a running container using the same settings it was started up with.

**Usage**

```bash
dh soe restart <container-name>
```

##### dh soe drush

Run [Drush](http://www.drush.org/en/master/s) inside on of your running containers. Sets up paths correctly so that it executes on your docroot.

**Usage**

```bash
dh soe start <container-name> [command]
```

### dh proxy

Starts up an automagic proxy container that allows multiple containers to share ports.

You shouldn't normally need to start or stop this manually—it should be brought up when required. This command is there for all the times it refuses to listen.

#### Subcommands
##### dh proxy start

Start the proxy container.

**Usage**

```bash
dh proxy start
```

##### dh proxy stop

Stop the proxy container.

**Usage**

```bash
dh proxy stop
```

##### dh proxy restart

Restart the proxy container.

**Usage**

```bash
dh proxy restart
```

### dh exec

Run a command (any command!) in a container.

**Usage**

```bash
dh exec <container-name> <command>
```

**Example**

```bash
dh exec foo tail -f /var/log/apache2/error.log
```

### dh shell

Attaches a bash shell to one of your containers and gives your full interactive control. Simply type `exit` to close.

**Usage**

```bash
dh shell <container-name>
```

**Example**

```bash
dh shell foo
```
