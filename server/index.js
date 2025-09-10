// Fallback entry point if TypeScript build fails
console.log('Starting CMF Studio Server...');

try {
    // Try to load the compiled TypeScript version
    require('./dist/index.js');
} catch (error) {
    console.error('Failed to load compiled version:', error.message);
    console.log('Starting development server...');
    
    // Fallback to direct TypeScript execution (for development)
    try {
        require('tsx/cjs').require('./src/index.ts');
    } catch (tsError) {
        console.error('Failed to start server:', tsError.message);
        process.exit(1);
    }
}