const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

async function cleanNextDirectory() {
  const nextDir = path.join(process.cwd(), '.next');
  const maxRetries = 3;
  let retryCount = 0;
  
  console.log(chalk.blue('🧹 Preparing build environment...'));
  
  while (retryCount < maxRetries) {
    try {
      // Check if .next exists
      try {
        await fs.access(nextDir);
        console.log(chalk.yellow('Found existing .next directory'));
      } catch {
        console.log(chalk.green('✨ Clean slate - no existing .next directory'));
        return;
      }

      if (process.platform === 'win32') {
        console.log(chalk.yellow('Ensuring no processes are locking files...'));
        try {
          // Force close any processes that might be holding onto files
          execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq next*"', { stdio: 'ignore' });
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch {
          // Ignore taskkill errors
        }
      }

      // Try multiple deletion methods
      try {
        console.log(chalk.yellow('Removing .next directory...'));
        await fs.rm(nextDir, { recursive: true, force: true });
        console.log(chalk.green('✅ Successfully cleaned .next directory'));
        return;
      } catch (err) {
        console.log(chalk.yellow('First cleanup attempt failed, trying alternative method...'));
        
        if (process.platform === 'win32') {
          try {
            execSync('rmdir /S /Q ".next"', { stdio: 'ignore' });
            console.log(chalk.green('✅ Successfully cleaned .next directory using Windows command'));
            return;
          } catch {
            throw new Error('Windows cleanup failed');
          }
        } else {
          try {
            execSync('rm -rf .next', { stdio: 'ignore' });
            console.log(chalk.green('✅ Successfully cleaned .next directory using Unix command'));
            return;
          } catch {
            throw new Error('Unix cleanup failed');
          }
        }
      }
    } catch (err) {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(chalk.yellow(`Retry attempt ${retryCount} of ${maxRetries}...`));
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      } else {
        console.warn(chalk.red('⚠️  Warning: Could not fully clean .next directory'));
        console.warn(chalk.red(`Error: ${err.message}`));
        console.log(chalk.yellow('Continuing with build anyway - Next.js will handle existing files'));
      }
    }
  }
}

// Execute the cleanup
cleanNextDirectory().then(() => {
  console.log(chalk.blue('\n🚀 Ready to start the build process...'));
}).catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});

cleanNextDirectory().catch(console.error);
