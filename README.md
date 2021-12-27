# Microservices with Node and React

## **Fundamentals**

In comparison to a monolith, a MS contains all aspects to make a single feature work instead of all features

**Pros**:

- Standalone: easier to debug and isolate
- Easily swappable
- Errors can be isolated to few MS instead of the whole app
- (Database-Per-Service) Each MS only uses its own Database in which case points of failure can be isolated
- Some MS may use different DBs (or other components) to optimize its feature

**Cons**:

- Data Management between MS since each one is isolated
- MS can never access the DBs of other MS and has to use a workaround that MSs have to provide

## Communication Types

![comminication types](./screenshots/communication_types.png)

**Synchronous**:

An MS feature directly gets desired data from other MSs to fulfill request.

**Pros**:

- Intuitive, easy to implement
- No own DB needed

**Cons**:

- High dependency with other MSs again
- Request is only as fast as the slowest request to a dependency

**Asynchronous**:

The current standard form of inter MS communication.

In this case, Service D has its own Database, which gets populated through the Event Bus. Services A, B, and C each store data in their respective DBs while also emitting an event to the Event Bus, notifying other services subscribed to the Event Bus about the transaction they made.

**Pros**:

- Independent / no webbing of services
- Very fast since it uses own DB
  **Cons**:
- Data duplication since DB is made of data from other DBs

## Event Bus

![event bus](./screenshots/event_bus.png)

- An event-driven pattern for broadcasting and managing events asynchronously
- Especially useful for the MS architecture for the advantages mentioned aboved
- In summary, an event bus (also broker) receives emitted events and passes the data along to subscribers anytime an event is emitted

# Blog example

The following goes through a rough overview of the patterns used in tried and tested solutions by implementing them by hand.

## Query Service

- This service really simply joins data and creates data related to presentation
- The client targets this service for getting data
- Other services are still available for creation purposes

## Moderation Service

- Say we need to perform a process on comments that are being created, a Moderation service serves this example for filtering out comments with certain content
- In order to prevent downsides, such as delays in rendering feature creep for the Query service, the following pattern is suggested to solve these issues

### Steps

- Comment service emits `CommentCreated` event
- Event bus sends to both the Query and Moderation service
- The Query service first gets a comment status of `pending`. This helps to conditionally notify clients of a loading state
- The Moderation service does the processing and emits back to the event bus with the newly calculated comment status and type `CommentModerated`
- The Event bus sends this back to the Comment service in order to update that comment's status to either `approved` or `rejected`
- Lastly, the Comment service emits a the comment back with type `CommentUpdated` so that the data is available in the Query service and ready for the client to update the render

## Syncing Events

A common issue is when a service is interrupted or a new service is introduced. This service would need all events that it missed in order to be in sync again with all other services. There are other patterns/solution to this as well, however, in oder to avoid feature creep the following is suggested, which also heavily relies on the Event bus:

![event sync](screenshots/event_sync.png)

- For every event the Event bus stores event in its DB
- Interrupted or newly introduced services then needs to fetch data from this DB to be in sync with other services
  - Another solution was to allow this new service access to the DBs of the other services, however, other services may have differing DB solutions, which the new service needs to know about and cater for
- Example can be executed, by shutting down the Query service and creating posts. Turn on the Query service again. This should let the Query service sync with the Event bus data on startup, making the client receive all the posts it missed

# References

- Feature Creep: When an implementation for a specific domain needs to accomodate the business logic of another domain it becomes more complex than it needs to be

---

---

# Docker & Kubernetes

- Docker as our Containerization solution to contain each of our MS in an environment that includes everything it needs for it to run
- Docker configs to include information / commands in order to run each service correctly
- Kubternetes to easily manage mutliple containers in terms of: auto scaling, container communication, commands

![kuberenets](screenshots/kubernetes.png)

Once installed locally, Docker is then able to use methods (Namespacing and Control Groups) to partition sections of the computer dedicated for each container it is meant to create. Since these methods are only native to Linux systems, Docker runs Linux virtual machine in the background to perform these methods by communicating to the Linux kernel. You can see the Linux version by running `docker version`.

![docker resources](screenshots/docker_resources.png)

## Terminology

Since some of the terms used in the context of Kubernetes is identical to terms used in other areas, the following should help elaborate these `Objects `:

`Kubernetes Cluster`: A collection of nodes + a master to manage them

`Node`: A virtual machine that will run our containers

`Pod`: More or less a running container. Technically a pod can run multiple containers

`Deployment`: Monitors a set of pods, making sure they are running and restarting them if they crash

`Service`: Provides an easy-to-remember URL to access a running container. It is with this, the Event Bus will communicate with in order to access the isolated Micro Services.

## Services

This resource object facilitates the communication both for within and the outside.

![services-types](./screenshots/services_types.png)

### NodePort

Gets assigned a random port number once created, which can then be access from `http://localhost:30162/posts`. This is typically used for dev purposes to access Pods from the outside since we need to manage the port number manually. Rather use Load Balancer

![nodeport](./screenshots/nodeport-communication.png)

```sh
❯ k apply -f posts-srv.yaml
service/posts-srv created

blog/infra/k8s on  master [?]
❯ k get services
NAME         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
kubernetes   ClusterIP   10.96.0.1     <none>        443/TCP          6d3h
posts-srv    NodePort    10.99.97.58   <none>        4000:30162/TCP   4m20s
```

### Cluster IP

Manages communication between Pods. You can also chain the creation of this resource object within the Deployment file.

### Load Balancer & Ingress

- Used as a single point of intereset for communication and helps routing to individual Pods
- Technically the former job of provisioning a single point of interest is the responsibility of a Load Balancer Service and the latter routing responsibility is done by an `Ingress` (`Ingress Controller`) pod
- Both work together: Once gets communication from the outside in to the cluser and the other for routing it to the correct pod's ClusterIP port.
- Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster. Traffic routing is controlled by rules defined on the Ingress resource.

![load-balancer](./screenshots/loadbalancer.png)
![ingress](./screenshots/ingress-srv.png)

Setting up Ingress with built-in Load Balancer

- Taken from https://kubernetes.github.io/ingress-nginx/: run to install all necessary resource objects:

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.0/deploy/static/provider/cloud/deploy.yaml
```

- Create an Ingress config service so that it knows were to route incomming calls, here `/ingress-srv.yaml` and run it
- For local development, edit your `/etc/hosts` file (tip: run `code /etc/hosts`) and when prompted run with permissions) and add this at the bottom

```text
127.0.0.1 posts.com
```

- This will route domains with name `posts.com` to localhost instead, which would essentially return the same response of `http://localhost:30162/posts` mentioned above

# Commands

## Docker

- `docker build -t cqtan/posts:0.0.1 .` Builds a image from a `Dockerfile` with a tag and version. The tag makes it easier to target instead of the default sha256 encoding. Leaving out the `:0.0.1` version will default to `:latest`, which will let K8 look for it on DockerHub instead of local
- `docker run -it <tag-name>`: Runs the image with given tag name. The `it` flag lets you use a nicely formatted terminal within the running container
- `docker ps`: Print out information about all running containers
- `docker logs` Print out logs from given container
- `docker exec -it <tag-name> <command>`: Execute a command in current Container

```sh
 => => writing image sha256:366e148f73ab3f2f519ab63fc76a08b6beb712871736c36da9c  0.0s
 => => naming to docker.io/cqtan/posts:0.0.1                                     0.0s
```

## Kubernetes

- `kubectl apply -f posts.yaml`: Run a Pod with given file called `posts.yaml`
- `kubectl get pods`: Print out all running Pods
- `kubectl get deployments`: Print out all running Deployments
- `kubectl exec -it <pod-name> <command>`: Execute a command in current Pod
- `kubectl delete pod <pod-name>`: Deletes a pod. Typically, to manually restart a Pod
- `kubectl describe pod <pod-name>`: Print out infos about the running Pod. Typically, to check the Event section for errors
- replace `pods` with `deployments` for Deployment commands
- `kubectl rollout restart deployments <depl-name>`

```sh
❯ kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
posts   1/1     Running   0          82s
```

# Tips

- Add this line `alias k="kubectl"` to your `.zshrc` file for a shortcut, e.g. `k get pods`
- You can chain the creation of multiple Resource Objects with `---` symbol
- If you see the option `-f` you can alternatively do `.` to target all yaml files instead

# Scenarios

### Updating code with running Deployment

- make change in code
- rebuild image **without** new version tag (implicitly @latest)
- push image to DockerHub
- update the Deployment yaml. Make sure it uses no version tag
- apply Deployment
- run Rollout command

```shell
❯ k rollout restart deployment posts-depl
deployment.apps/posts-depl restarted

blog/infra/k8s on  master [✘!?]
❯ k get deployments
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
posts-depl   1/1     1            1           43s

blog/infra/k8s on  master [✘!?]
❯ k get pods
NAME                      READY   STATUS    RESTARTS      AGE
posts                     1/1     Running   1 (35m ago)   3d
posts-depl-f78c77-hbl67   1/1     Running   0             14s
```

- Debug running pods with `kubectl logs <pod-id>` will print out logs
