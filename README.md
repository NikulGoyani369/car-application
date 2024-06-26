# car-application list of requirements

# Specifications
- Use Typescript, Express.js, Node.js


# REST-Application
The REST-Application provides an interface to interact with Client-Application.
All the data must be stored in a database (MongoDB).
The following information should be saved:
- Manufacturer (ID, Name)
- Models of manufacturer (Name)
# Example:
- 1 Audi
     - A3
     - A4
     - Q5
- 2 VW
    - Passat
    - Golf
    - Jetta

# Client-Application (Console Application)
The Client-Application haven’t any GUI.
You can interact only with console commands.

# The following commands must be supported:
- “c” – Create a new manufacturer (Name)
- “l” – List all manufacturers (ID, Name, Number of models)
- “d” – Delete a manufacturer by ID
- “v" – View all models of manufacturer by manufacturer-ID
- “a” – Add a new model (Name) by manufacturer-ID
- “h” – Show help
 
# The Client-Application have an offline support.
- If the REST service is offline or not reachable, the user can continue to work with the Client-Application. As soon as the REST service is available again, all changes will be synchronized.
# Notice: A another instance of application could have updated the data online. You must be merge the local storage.
