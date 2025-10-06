const { spawn } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');

// Helper function to run a command and show a spinner
async function runCommand(command, args, text) {
    const spinner = ora(text).start();
    
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';

        proc.stdout.on('data', (data) => {
            output += data.toString();
            // Update spinner text with relevant build information
            if (data.toString().includes('Creating an optimized production build')) {
                spinner.text = 'Creating optimized production build...';
            } else if (data.toString().includes('Compiled successfully')) {
                spinner.succeed('Compilation successful');
            }
        });

        proc.stderr.on('data', (data) => {
            output += data.toString();
            // Show warnings/errors in yellow
            console.log(chalk.yellow(data.toString()));
        });

        proc.on('close', (code) => {
            if (code === 0) {
                spinner.succeed();
                resolve(output);
            } else {
                spinner.fail();
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function build() {
    console.log(chalk.blue.bold('🚀 Starting production build process\n'));
    
    try {
        // Set environment variables
        process.env.NODE_ENV = 'production';
        process.env.NEXT_TELEMETRY_DISABLED = '1';

        // Clean installation
        console.log(chalk.cyan('📦 Checking dependencies...'));
        await runCommand('npm', ['install'], 'Installing dependencies...');

        // Type checking
        console.log(chalk.cyan('\n🔍 Running type checks...'));
        await runCommand('npm', ['run', 'type-check'], 'Checking TypeScript types...');

        // Linting
        console.log(chalk.cyan('\n💅 Linting code...'));
        await runCommand('npm', ['run', 'lint'], 'Running ESLint...');

        // Building
        console.log(chalk.cyan('\n🏗️  Building production bundle...'));
        await runCommand('next', ['build'], 'Creating optimized production build...');

        console.log(chalk.green.bold('\n✨ Build completed successfully!\n'));
        
    } catch (error) {
        console.error(chalk.red('\n❌ Build failed:'), error.message);
        process.exit(1);
    }
}

build();
