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

echo "===== Installing amazon cloudwatch agent ====="
# if using parameter to add the config json file - add parameter to parameter store AmazonCloudWatch/CloudLearningTracker with file date.
# add IAm policy to role for EC2 and give get parameter access to ec2 to use the parameter created
dnf install -y amazon-cloudwatch-agent

systemctl enable amazon-cloudwatch-agent

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c ssm:/AmazonCloudWatch/CloudLearningTracker -s

# if parameter is not using so manually create the file - but this will make user data file big
# dnf install amazon-cloudwatch-agent -y

# mkdir -p /opt/aws/amazon-cloudwatch-agent/etc

# cat <<EOF >/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
# {
#   "agent": {
#     "metrics_collection_interval": 60,
#     "run_as_user": "root"
#   },
#   "metrics": {
#     "namespace": "CloudLearningTracker",
#     "append_dimensions": {
#       "InstanceId": "\${aws:InstanceId}"
#     },
#     "metrics_collected": {
#       "mem": {
#         "measurement": [
#           "mem_used_percent"
#         ]
#       },
#       "disk": {
#         "measurement": [
#           "used_percent"
#         ],
#         "resources": [
#           "/"
#         ]
#       }
#     }
#   }
# }
# EOF

# systemctl enable amazon-cloudwatch-agent

# /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
# -a fetch-config \
# -m ec2 \
# -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
# -s

echo "===== Verify Installation ====="

docker --version
docker compose version
git --version
amazon-cloudwatch-agent-ctl -h

mkdir /home/ec2-user/CloudLearningTracker
echo "===== Bootstrap Completed ====="
