import { defineConfig } from 'vite';

export default defineConfig({
    appType: 'mpa',

    build: {
        rollupOptions: {
            input: {
                main: `${import.meta.dirname}/index.html`,

                'base-demo': `${import.meta.dirname}/demos/base-demo/base-demo.html`,
                'procedural-meshes': `${import.meta.dirname}/demos/procedural-meshes/demo-procedural-meshes.html`,
                'pipeline-bind-groups': `${import.meta.dirname}/demos/pipeline-bind-groups/demo-pipeline-bind-groups.html`,
                'pipeline': `${import.meta.dirname}/demos/pipeline/demo-pipeline.html`,
                'shadow-mapping': `${import.meta.dirname}/demos/shadow-mapping/demo-shadow-mapping.html`,
                'glTF': `${import.meta.dirname}/demos/load-glTF-mesh/demo-load-glTF.html`,
                'load-obj-mesh': `${import.meta.dirname}/demos/load-obj-mesh/demo-load-obj-mesh.html`,
            },
        },
    },
});