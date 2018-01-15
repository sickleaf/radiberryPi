#!/bin/bash

seekSec=$1
socketPath="$2"

string="{ \"command\": [\"seek\", ${1}] }"
echo $string | socat - "$2"
