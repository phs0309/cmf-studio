// CMF Studio Server Entry Point
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting CMF Studio Server...');
console.log('📂 Working directory:', process.cwd());
console.log('📁 Directory contents:', fs.readdirSync('.'));

// Check if compiled TypeScript version exists
const distPath = path.join(__dirname, 'dist', 'index.js');
const srcPath = path.join(__dirname, 'src', 'index.ts');

console.log('🔍 Checking for compiled version at:', distPath);
console.log('🔍 Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
    console.log('✅ Loading compiled TypeScript version...');
    try {
        require('./dist/index.js');
    } catch (error) {
        console.error('❌ Failed to load compiled version:', error.message);
        process.exit(1);
    }
} else {
    console.log('⚠️  Compiled version not found, trying to compile...');
    
    // Try to run TypeScript compiler
    const { exec } = require('child_process');
    exec('npx tsc', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ TypeScript compilation failed:', error.message);
            console.error('stderr:', stderr);
            process.exit(1);
        }
        
        console.log('✅ TypeScript compilation successful');
        console.log('stdout:', stdout);
        
        // Now try to load the compiled version
        try {
            require('./dist/index.js');
        } catch (loadError) {
            console.error('❌ Failed to load newly compiled version:', loadError.message);
            process.exit(1);
        }
    });
}