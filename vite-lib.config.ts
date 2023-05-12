import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: [
                resolve(__dirname, 'src/background/background.ts'),
                resolve(__dirname, 'src/content/content.ts'),
                resolve(__dirname, 'src/content/execute.ts')],
            name: 'extension',
            fileName: (format, entry) => {
                return `${entry}.js`
            }
        },
    }
})
