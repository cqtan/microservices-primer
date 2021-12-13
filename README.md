# Microservices with Node and React

## Basics: Microservices

- In comparison to a monolith, a microservice contains all aspects to make a single feature work instead of all features
- Advantages:
  - Standalone: easier to debug and isolate
  - Easily swappable
  - Errors can be isolated to few Microservices instead of the whole app
  - (Database-Per-Sercive) Each MS only uses its own Database in which case points of failure can be isolated
  - Some microservices may use different DBs (or other components) to optimize its feature
- Disadvantages:
  - Data Management between Microservices since each one is isolated
  - Microservices can never access the DBs of other Microservices and has to use a workaround that MSs have to provide
