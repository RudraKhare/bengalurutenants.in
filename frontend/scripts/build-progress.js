const chalk = require('chalk');

const BUILD_STEPS = [
  { name: 'Environment Setup', duration: '1-2s' },
  { name: 'TypeScript Compilation', duration: '5-10s' },
  { name: 'Page Generation', duration: '10-15s' },
  { name: 'Route Processing', duration: '5-10s' },
  { name: 'Asset Optimization', duration: '10-20s' },
  { name: 'Bundle Creation', duration: '15-30s' },
  { name: 'Cache Generation', duration: '5-10s' }
];

let startTime = Date.now();
let currentStep = 0;

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 
    ? `${minutes}m ${seconds % 60}s`
    : `${seconds}s`;
}

function logProgress() {
  console.clear();
  const elapsedTime = formatTime(Date.now() - startTime);
  
  console.log(chalk.blue.bold('📦 Next.js Production Build'));
  console.log(chalk.gray(`⏱️  Time elapsed: ${elapsedTime}\n`));

  BUILD_STEPS.forEach((step, index) => {
    const prefix = index < currentStep 
      ? chalk.green('✓')
      : index === currentStep
        ? chalk.yellow('⟳')
        : chalk.gray('○');
    
    const text = index === currentStep
      ? chalk.yellow(step.name)
      : index < currentStep
        ? chalk.green(step.name)
        : chalk.gray(step.name);
    
    const duration = chalk.gray(`(Est: ${step.duration})`);
    
    console.log(`${prefix} ${text.padEnd(25)} ${duration}`);
  });

  console.log('\n' + chalk.gray('⚡ Building... Please wait while we optimize your application'));
  
  if (currentStep < BUILD_STEPS.length) {
    currentStep++;
    setTimeout(logProgress, 3000);
  }
}

// Start the progress display
console.log(chalk.blue.bold('\n🚀 Starting production build...\n'));
logProgress();
