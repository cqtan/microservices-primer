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

# References

- Feature Creep: When an implementation for a specific domain needs to accomodate the business logic of another domain it becomes more complex than it needs to be
