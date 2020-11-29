import * as pulumi from "@pulumi/pulumi";
import * as k8sjs from "./k8sjs";

const config = new pulumi.Config();

const redisLeader = new k8sjs.ServiceDeployment("redis-leader", {
    image: "redis",
    ports: [6379],
});

const redisReplica = new k8sjs.ServiceDeployment("redis-replica", {
    image: "pulumi/guestbook-redis-replica",
    ports: [6379],
});

const frontend = new k8sjs.ServiceDeployment("frontend", {
    replicas: 3,
    image: "tammy.azurecr.io/guestbook:latest",
    ports: [3000],
    allocateIpAddress: true,
});

export let frontendIp = frontend.ipAddress;


