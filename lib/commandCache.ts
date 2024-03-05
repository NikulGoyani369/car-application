// Define a global array to cache commands
export const commandCache: unknown[] = [];

// Define a global variable to store the last cached command
let lastCachedCommand: { commandFunction: Function; args: string[] } | null =
  null;

// Function to execute cached commands when online
export const executeCachedCommands = async () => {
  try {
    // // If lastCachedCommand exists, execute it
    // if (lastCachedCommand) {
    //   console.log(
    //     "Executing last cached command:",
    //     lastCachedCommand.commandFunction.name,
    //     lastCachedCommand.args
    //   );
    //   await executeCommand(lastCachedCommand);
    // }

    // // Clear the last cached command after execution
    // lastCachedCommand = null;

    // Loop through the cached commands and execute each one
    for (const command of commandCache) {
      await executeCommand(command);
    }

    // Clear the command cache after executing all commands
    commandCache.length = 0;
  } catch (error) {
    console.error("Error executing cached commands:", error);
  }
};

// Modify cacheCommand to accept the function and its arguments
export const cacheCommand = (commandFunction: Function, ...args: string[]) => {
  console.log("Caching command offline:", commandFunction.name, args);

  // // Store the last cached command
  // lastCachedCommand = { commandFunction, args };

  // console.log("Last cached command:", lastCachedCommand);

  // Push the command function and its arguments to the command cache
  commandCache.push({ commandFunction, args });
};

// executeCommand to execute the cached command function with its arguments
const executeCommand = async (command: any) => {
  try {
    // Extract the cached command function and its arguments
    const { commandFunction, args } = command;

    // Execute the cached command function with its arguments
    if (commandCache.length > 0) {
      console.log("Execute the cached command function with its arguments.");
      commandFunction(...args);
    }

    console.log("Command executed:", commandFunction.name, args);
  } catch (error) {
    console.error("Error executing command:", command, error);
  }
};
