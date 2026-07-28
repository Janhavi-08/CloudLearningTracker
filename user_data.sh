#!/bin/bash

set -e

echo "===== Updating System ====="
dnf update -y

echo "===== Installing Docker ====="
dnf install -y docker git

echo "===== Starting Docker ====="
systemctl enable docker
systemctl start docker

echo "===== Add ec2-user to docker group ====="
usermod -aG docker ec2-user

echo "===== Installing Docker Compose ====="

DOCKER_CONFIG=/usr/local/lib/docker
mkdir -p $DOCKER_CONFIG/cli-plugins

curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose

chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

echo "===== Verify Installation ====="

docker --version
docker compose version
git --version

echo "===== Bootstrap Completed ====="
