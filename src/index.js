import { exec } from "child_process";
import chalk from "chalk";
import fs from "fs";

(async function () {
  const TYPESCRIPT_REPO =
    "https://github.com/akash-basavaraju/react-package-devserver-boilerplate.git";
  const BABEL_REPO =
    "https://github.com/akash-basavaraju/react-package-dev-babel.git";

  const [packageName, ...options] = process.argv.filter((arg) => {
    return !(
      arg.includes("/node") ||
      arg.includes("sudo") ||
      arg.includes("create-react-package-env")
    );
  });

  const isSkipInstall =
    options.includes("-si") || options.includes("--skip-install");
  const isTypescript =
    options.includes("-t") || options.includes("--typescript");
  const isOpenCode = options.includes("-o") || options.includes("--open");
  const isNpmInstall = options.includes("-n") || options.includes("-npm");

  if (!packageName) {
    console.log(chalk.red("Please specify the package name"));
    process.exit();
  }

  function execShellCommand(cmd, info, errorMsg, isChecking = false) {
    console.log(chalk.blueBright(info));
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
    `git clone ${isTypescript ? TYPESCRIPT_REPO : BABEL_REPO} ${packageName}`,
    "Cloning the repo...",
    "Error occurred while cloning the repo"
  );

  try {
    console.log(chalk.blueBright("Cleaning the package..."));
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
      JSON.stringify(packageJsonObj, undefined, 4)
    );
  } catch (err) {
    console.log(chalk.red("Error Occurred while applying the package name"));
    process.exit();
  }

  await execShellCommand(
    `cd ${packageName} && rm -rf .git && git init && git add . && git commit -m 'Initial Commit'`,
    "Resetting git...",
    "Error while resetting git"
  );

  const yarnCheck = await execShellCommand(
    "yarn -v",
    "Checking yarn...",
    "yarn not installed",
    true
  );

  if (!isSkipInstall) {
    if (yarnCheck === "Failed") {
      console.log(chalk.yellow("Using npm for installation."));
    } else {
      console.log(
        chalk.yellow(
          "Using yarn for installation. Use '-n' or '-npm' for npm installation."
        )
      );
    }
  }

  if (!isSkipInstall) {
    await execShellCommand(
      `cd ./${packageName} && ${
        yarnCheck === "Failed" || isNpmInstall ? "npm install" : "yarn"
      }`,
      "Installing packages (this takes time) ...",
      "Error while installing packages"
    );
  } else {
    console.log(chalk.yellow("Skipped package installation"));
  }

  if (isOpenCode) {
    await execShellCommand(
      `code ./${packageName}`,
      "Opening VS Code...",
      "Error while Opening VS Code"
    );
  } else {
    console.log(chalk.yellow("Use '-o' or '--open' for opening VS Code."));
  }
  console.log(chalk.blueBright("Done! Happy Coding."));
})();
