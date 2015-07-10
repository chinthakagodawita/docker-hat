#!/usr/bin/env bash

set -o nounset

##
# Comapability checks
##
if ! [ -x "$(type -P boot2docker)" ]; then
  echo "ERROR: script requires boot2docker"
  echo "For Mac try 'brew install boot2docker'"
  exit 1
fi

# User-entered container name.
C_NAME=${1:-}

# Wrapper command to be executed.
SB_CMD=${2:-}

# `docker exec` command to be run.
D_CMD=${3:-}

# Name for the nginx proxy container.
CONT_NAME="SB_proxy"

##
# Functions
##
help() {
  echo " "
  echo "SB Docker Tool"
  echo " "
  echo "options:"
  echo "-h, --help                    show this help"
  echo "sb [name] start               run project in docker"
  echo "sb [name] stop                stop the project's docker container"
  echo "sb [name] restart             restart the project's docker container"
  echo "sb [name] exec [command]      execute a command in the project container tty"
  echo " "

  exit 0
}

# Make sure that the nginx proxy container is always running.
ensure_proxy() {
  if exists $CONT_NAME; then
    echo "Proxy already running."

    # Start in case it's stopped.
    docker start $CONT_NAME
  else
    # Stop & cleanup any existing.
    stop $CONT_NAME

    ID=$(docker run -d \
      --name="$CONT_NAME" \
      -p 80:80 \
      -p 443:443 \
      -p 9000:9000 \
      -v /var/run/docker.sock:/tmp/docker.sock:ro \
      jwilder/nginx-proxy)

    if [[ -n $ID ]]; then
      echo "Started proxy container."
    else
      echo "ERROR: Failed to start proxy container."
      exit 1
    fi
  fi
}

start() {
  if exists ${1:-} ; then

    echo "ERROR: $C_NAME already exists"
    echo "       - try 'sb $C_NAME (restart|stop) instead"

  else
    # Run proxy if needed.
    ensure_proxy

    # Run image and mount current dir as doc root
     ID=$(docker run -d \
       -e VIRTUAL_HOST="$C_NAME" \
       -v `pwd`:/var/www \
       --name="$C_NAME" \
       -t chinthakagodawita/soe:php5.3)

    if [[ -n $ID ]]; then

      echo "$C_NAME running in container $ID"

      # Add correct localbox host record for MySQL
      IP=$(ifconfig $(VBoxManage showvminfo boot2docker-vm --machinereadable | grep hostonlyadapter | cut -d '"' -f 2) | grep inet | cut -d ' ' -f 2)

      docker exec -d $ID sh -c "echo '$IP localbox' >> /etc/hosts"

      # Add site hostname to apache and hosts file
      docker exec -d $ID sh -c "sed -i -r s/---HOSTNAME---/$C_NAME/ /etc/apache2/sites-enabled/*default*"
      docker exec -d $ID sh -c "sudo apachectl restart"

    else
      echo "ERROR: Failed to start $C_NAME"
    fi
  fi
}

stop() {
  if exists $1 ; then
    docker kill $1
    docker rm $1

    echo "Stopped: $1"
  fi
}

execcommand() {
  docker exec -it $1 $2

  echo "Executed: $2 in $1"
}

exists() {
  if ! [[ "/$1" == $(docker inspect --format="{{ .Name }}" $1) ]]; then
    # Exists
    return 1
  fi

  # Default, does not exist
  return 0
}

##
# Options
##
helpflag='false'

while getopts 'h' flag; do
  case "${flag}" in
    h) helpflag='true' ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done

if [ $helpflag == 'true' ] || [ $# -lt 2 ]; then
  help
fi

##
# Main execution.
##
case "$SB_CMD" in
'start')
  # Run project in docker.
  start $C_NAME
  ;;
'stop')
  # Stop current project.
  stop $C_NAME
  ;;
'restart')
  stop $C_NAME
  start $C_NAME
  ;;
'exec')
  # Exec in current project.
  execcommand $C_NAME $D_CMD
  ;;
*)
  help
  ;;
esac
