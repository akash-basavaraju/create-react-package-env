import { exec } from "child_process";
import chalk from "chalk";
import fs from "fs";

(async function () {
  const TYPESCRIPT_REPO =
    "https://github.com/akash-basavaraju/react-package-devserver-boilerplate.git";
  const BABEL_REPO =
    "https://github.com/akash-basavaraju/react-package-dev-babel.git";

  const [packageName, ...options] = process.argv.slice(2);

  if (!packageName) {
    console.log(chalk.red("Please specify the package name"));
    process.exit();
  }

  function execShellCommand(cmd, info, errorMsg, isChecking = false) {
    console.log(chalk.blue(info));
    return new Promise((resolve) => {
      exec(cmd, (error, stderr, stdout) => {
        if (error) {
          if (isChecking) {
            resolve("Failed");
            return;
          }
          console.log(chalk.red(error));
          console.log(chalk.red(errorMsg));
          process.exit();
        }
        if (isChecking) {
          resolve("Passed");
          return;
        }
        resolve(stdout);
      });
    });
  }

  await execShellCommand(
    `git clone ${
      options.includes("-t") || options.includes("--typescript")
        ? TYPESCRIPT_REPO
        : BABEL_REPO
    } ${packageName}`,
    "Cloning the repo...",
    "Error occurred while cloning the repo"
  );

  try {
    console.log(chalk.blue("Cleaning the package..."));
    const jsonRaw = fs.readFileSync(`./${packageName}/package.json`);
    const packageJsonObj = JSON.parse(jsonRaw);
    packageJsonObj.name = packageName;
    packageJsonObj.description = "To be added";
    packageJsonObj.version = "1.0.0";
    packageJsonObj.author = "";
    packageJsonObj.repository = {};
    packageJsonObj.bugs = {};
    packageJsonObj.keywords = [];
    packageJsonObj.homepage = "";

    fs.unlinkSync(`./${packageName}/package.json`);
    fs.writeFileSync(
      `./${packageName}/package.json`,
      JSON.stringify(packageJsonObj)
    );
  } catch (err) {
    console.log(chalk.red("Error Occurred while applying the package name"));
    process.exit();
  }

  await execShellCommand(
    `cd ${packageName} && rm -rf .git && git init`,
    "Resetting git...",
    "Error while resetting git"
  );

  const yarnCheck = await execShellCommand(
    "yarn -v",
    "Checking yarn...",
    "yarn not installed",
    true
  );

  if (yarnCheck === "Failed") {
    console.log(chalk.yellow("Using npm for installation."));
  } else {
    console.log(
      chalk.yellow(
        "Using yarn for installation. Use '-n' or '-npm' for npm installation."
      )
    );
  }

  await execShellCommand(
    `cd ./${packageName} && ${
      yarnCheck === "Failed" ||
      options.includes("-n") ||
      options.includes("-npm")
        ? "npm install"
        : "yarn"
    }`,
    "Installing packages (this takes time) ...",
    "Error while installing packages"
  );

  if (options.includes("-o") || options.includes("--open")) {
    await execShellCommand(
      `code ./${packageName}`,
      "Opening VS Code...",
      "Error while Opening VS Code"
    );
  } else {
    console.log(chalk.blue("Use '-o' or '--open' for opening VS Code."));
  }
  console.log(chalk.blue("Done! Happy Coding."));
})();
