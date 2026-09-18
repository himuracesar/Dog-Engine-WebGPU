/**
 * Sponza scene for deferred rendering demo.
 * 
 * @version 1.0
 * @author César Himura
 */
class SponzaScene extends DogScene {
    constructor() {
        super();

        this.wireframePipeline;

        this.camera;

        this.bindGroupLayouts;
        this.gBufferBindGroupLayout;
        this.gBufferBindGroup;

        //textures
        this.depthTexture;
        this.albedoTexture;
        this.normalTexture;

        this.propsBindGroup;
        this.propsBindGroupLayout;
        this.propsBuffer;

        //meshes
        this.sponza;

        this.gBuffersPipeline;
        this.gBuffersDescriptor;

        this.renderDescriptor;

        this.directionalLight;

        this.lightsBufferComputeBindGroup;
        this.lightUpdateComputePipeline;
        this.lightsBufferBindGroupLayout;
        this.lightsBufferBindGroup;
    }

    /**
     * Initialize the scene.
     */
    async init() {
        let configScene = await webGPUengine.readFileAsJson("config/camera-material-mesh.json");

        webGPUengine.createBindGroupLayouts(configScene);

        this.camera = new DogCamera();
        this.camera.setPosition([0.0, 0.0, 100.0]);
        this.camera.setSpeed(4.3);
        this.camera.setFarPlane(4000.0);

        await this.createShapes();
        this.createProps();
        this.createRenderTargets();
        this.createGBufferBindGroup();
        this.createMaterialsAndLights();
        await this.createDynamicLights();
        await this.createPipeline();

        this.gBuffersDescriptor = {
            colorAttachments: [
                {
                    view: this.albedoTexture.getWebGPUTextureView(),
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
                {
                    view: this.normalTexture.getWebGPUTextureView(),
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: this.depthTexture.getWebGPUTextureView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };

        this.textureQuadPassDescriptor = {
            colorAttachments: [
                {
                    // view is acquired and set in render loop.
                    view: undefined,

                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        await this.createUI();
    }

    /**
     * Update the scene.
     * @param {float} deltaTime The time elapsed since the last update.
     */
    update(deltaTime) {
        this.sponza.update(deltaTime);

        this.directionalLight.setDirection([this.directionalLightState.direction.x, this.directionalLightState.direction.y, this.directionalLightState.direction.z, 0.0]);
        this.directionalLight.setColor([this.directionalLightState.color.r, this.directionalLightState.color.g, this.directionalLightState.color.b, this.directionalLightState.color.a]);
        this.directionalLight.setEnabled(this.directionalLightState.enabled);
        this.directionalLight.setIntensity(this.directionalLightState.intensity);

        this.numLights = this.pointLightsState.numLights;
        pGraphics.device.queue.writeBuffer(this.configUniformBuffer, 0, new Uint32Array([this.numLights]));
    }

    /**
     * Render the scene.
     */
    render() {
        const commandEncoder = pGraphics.device.createCommandEncoder();
        {
            pGraphics.device.queue.writeBuffer(this.camera.getBuffer().getWebGPUBuffer(), 0, this.camera.getViewMatrix());
            pGraphics.device.queue.writeBuffer(this.camera.getBuffer().getWebGPUBuffer(), 16 * 4, this.camera.getProjectionMatrix());

            // Write position, normal, albedo etc. data to gBuffers
            const gBufferPass = commandEncoder.beginRenderPass(this.gBuffersDescriptor);
            gBufferPass.setPipeline(this.gBuffersPipeline.getWebGPUPipeline());
            gBufferPass.setBindGroup(0, this.camera.getBindGroup());

            this.sponza.render(gBufferPass);

            gBufferPass.end();
        }
        {
            // Update lights position
            const lightPass = commandEncoder.beginComputePass();
            lightPass.setPipeline(this.lightUpdateComputePipeline);
            lightPass.setBindGroup(0, this.lightsBufferComputeBindGroup);
            lightPass.dispatchWorkgroups(Math.ceil(this.kMaxNumLights / 64));
            lightPass.end();
        }
        {
            pGraphics.device.queue.writeBuffer(this.camera.getBuffer().getWebGPUBuffer(), 0, this.camera.getViewMatrix());
            pGraphics.device.queue.writeBuffer(this.camera.getBuffer().getWebGPUBuffer(), 16 * 4, this.camera.getProjectionMatrix());

            pGraphics.device.queue.writeBuffer(this.directionalLight.getBuffer().getWebGPUBuffer(), 0, this.directionalLight.getData());

            // Deferred rendering
            this.textureQuadPassDescriptor.colorAttachments[0].view = pGraphics.context.getCurrentTexture().createView();
            const deferredRenderingPass = commandEncoder.beginRenderPass(this.textureQuadPassDescriptor);

            deferredRenderingPass.setPipeline(this.deferredRenderingPipeline.getWebGPUPipeline());
            deferredRenderingPass.setBindGroup(0, this.camera.getBindGroup());
            deferredRenderingPass.setBindGroup(1, this.gBufferBindGroup);
            deferredRenderingPass.setBindGroup(2, this.directionalLight.getBindGroup());
            deferredRenderingPass.setBindGroup(3, this.lightsBufferBindGroup);

            deferredRenderingPass.draw(6);

            deferredRenderingPass.end();
        }

        const commandBuffer = commandEncoder.finish();

        // Finish the command buffer and immediately submit it.
        pGraphics.device.queue.submit([commandBuffer]);
    }

    //-------------------------- Input -------------------------
    /**
     * Release click and stop dragging.
     * @param {MouseEvent} event 
     */
    onMouseUp(event) {
        this.dragging = false;
        mouse.down = false;
    }

    /**
     * Click and start dragging.
     * @param {MouseEvent} event 
     */
    onMouseDown(event) {
        this.dragging = true;
        let x = event.clientX; // x coordinate of a mouse pointer
        let y = event.clientY; // y coordinate of a mouse pointer
        let rect = event.target.getBoundingClientRect();

        //console.log("Mouse down at: " + x + ", " + y);
        mouse.down = true;
        mouse.x = x;
        mouse.y = y;

        //x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        //y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
        console.log("Mouse down at: " + x + ", " + y);
    }

    /**
     * If dragging, calculates the difference in mouse position and rotates the camera.
     * @param {MouseEvent} event 
     */
    onMouseMove(event) {
        this.lastX = this.x;
        this.lastY = this.y;

        this.x = event.clientX;
        this.y = event.clientY;

        mouse.x = this.x;
        mouse.y = this.y;

        if (!this.dragging)
            return;

        const dx = this.x - this.lastX;
        const dy = this.y - this.lastY;

        this.camera.yaw(dx * this.camera.getSpeedRotation());
        this.camera.pitch(dy * this.camera.getSpeedRotation());
    }

    /**
     * Handles input events.
     */
    input() {
        if (keypress[KeyCode.W])
            this.camera.moveForward(1);
        if (keypress[KeyCode.S])
            this.camera.moveForward(-1);
        if (keypress[KeyCode.A])
            this.camera.strafe(-1);
        if (keypress[KeyCode.D])
            this.camera.strafe(1);
        if (keypress[KeyCode.Left])
            this.camera.yaw(0.01);
        if (keypress[KeyCode.Right])
            this.camera.yaw(-0.01);
        if (keypress[KeyCode.Up])
            this.camera.pitch(0.01);
        if (keypress[KeyCode.Down])
            this.camera.pitch(-0.01);
    }

    //------------------- main functions -------------------
    async createShapes() {
        this.sponza = await webGPUengine.createMeshByObjFile("/resources/models/sponza/sponza.obj");
        this.sponza.getTransform().translateAbsolute(0.0, 0.0, 0.0);
    }

    /**
     * Creates all pipelines used in the scene.
     */
    async createPipeline() {
        const bglWireframe = [
            resourceManager.getBindGroupLayout(0),
            undefined,
            this.propsBindGroupLayout,
            resourceManager.getBindGroupLayout(3),
        ];

        this.wireframePipeline = new WireframePipeline(bglWireframe);

        let gBuffersShaders = [
            await webGPUengine.readFileAsText("shaders/Common.wgsl"),
            await webGPUengine.readFileAsText("shaders/LightsAndMaterial.wgsl"),
            await webGPUengine.readFileAsText("shaders/GBuffersShader.wgsl")
        ];

        const gBufferBgl = [
            resourceManager.getBindGroupLayout(0),
            undefined,
            resourceManager.getBindGroupLayout(2),
            resourceManager.getBindGroupLayout(3),
        ];

        this.gBuffersPipeline = new GBUffersPipeline("GBuffers-", gBufferBgl, gBuffersShaders);

        let deferredRenderingShaders = [
            await webGPUengine.readFileAsText("shaders/Common.wgsl"),
            await webGPUengine.readFileAsText("shaders/LightsAndMaterial.wgsl"),
            await webGPUengine.readFileAsText("shaders/DeferredRenderingShader.wgsl")
        ];

        const bglDeferredRendering = [
            resourceManager.getBindGroupLayout(0),
            this.gBufferBindGroupLayout,
            this.directionalLightBindGroupLayout,
            this.lightsBufferBindGroupLayout
        ]

        this.deferredRenderingPipeline = new DeferredRenderingPipeline("DeferredRendering", bglDeferredRendering, deferredRenderingShaders);
    }

    createProps() {
        this.propsBindGroupLayout = pGraphics.device.createBindGroupLayout({
            entries: [{
                binding: 0,                           // Same index as in the bindGroup
                visibility: GPUShaderStage.FRAGMENT,    // In which stages is visible
                buffer: {
                    type: "uniform"                     // uniform buffer (default)
                }
            }]
        });

        let propsData = new Float32Array([1.0, 1.0, 0.0, 1.0]); // Color amarillo
        this.propsBuffer = pGraphics.device.createBuffer({
            size: propsData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        //pGraphics.device.queue.writeBuffer(propsBuffer, 0, propsData.buffer);

        this.propsBindGroup = pGraphics.device.createBindGroup({
            layout: this.propsBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.propsBuffer,
                    },
                },
            ],
        });
    }

    /**
     * Create render targets for deferred rendering.
     */
    createRenderTargets() {
        this.depthTexture = webGPUengine.createDogTexture("depthTexture", {
            size: [canvas.width, canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });

        this.albedoTexture = webGPUengine.createDogTexture("albedoTexture", {
            size: [canvas.width, canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba8unorm', //'bgra8unorm',
        });

        this.normalTexture = webGPUengine.createDogTexture("normalTexture", {
            size: [canvas.width, canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba16float',
        });
    }

    createGBufferBindGroup() {
        this.gBufferBindGroupLayout = pGraphics.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
            ],
        });

        this.gBufferBindGroup = pGraphics.device.createBindGroup({
            layout: this.gBufferBindGroupLayout,
            entries: [
                { binding: 0, resource: this.albedoTexture.getWebGPUTextureView() },
                { binding: 1, resource: this.normalTexture.getWebGPUTextureView() },
                { binding: 2, resource: this.depthTexture.getWebGPUTextureView() },
            ],
        });
    }

    /**
     * Creates the materials and lights for the scene.
     */
    createMaterialsAndLights() {
        this.directionalLight = new DogDirectionalLight(true, false);
        this.directionalLight.setEnabled(false);
        //this.directionalLight.setColor([1.0, 0.0, 0.0, 1.0]);

        this.directionalLightBindGroupLayout = pGraphics.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform',
                    },
                }
            ],
        });

        const idBindGroupBuffer = this.createBGBuffer(this.directionalLight, 0, this.directionalLightBindGroupLayout);

        /*const material = new DogMaterial("m_yellow", true, false);
        material.setDiffuseColor([1.0, 1.0, 0.0, 1.0]);
        material.setAmbientColor([0.1, 0.1, 0.0, 1.0]);
        material.setSpecularColor([0.7, 0.7, 0.7, 1.0]);

        resourceManager.add("m_yellow", material);

        const dummyTexture = webGPUengine.createDummyTexture();
        const sampler = webGPUengine.createDogSampler("sampler-linear", { magFilter: "linear", minFilter: "linear" });

        const idBindGroup = this.createBGMaterialTexSamp(material, dummyTexture, sampler);
        //material.setIdBindGroup(idBindGroup);

        this.cube.setMaterial(0, material.getId());

        const defaultMaterial = webGPUengine.createDefaultMaterial("default-material", true, false);
        const idBindGroupDefMat = this.createBGMaterialTexSamp(defaultMaterial, dummyTexture, sampler);

        this.floor.setMaterial(0, defaultMaterial.getId());*/
    }

    /**
     * Creates a bind group for a material and texture and sampler.
     * @param {DogMaterial} material The material to create a bind group for.
     * @param {DogTexture} texture The texture to create a bind group for.
     * @param {DogSampler} sampler The sampler to create a bind group for.
     * @returns {GPUBindGroup} The bind group for the material.
     */
    createBGMaterialTexSamp(material, texture, sampler) {
        material.setDiffuseTextureIndex(texture.getName());
        texture.setIdSampler(sampler.getName());

        const jsonMaterial = {
            label: "Material Bind Group",
            layout: resourceManager.getBindGroupLayout(2),
            entries: [
                {
                    binding: material.getBinding(),
                    resource: { buffer: material.getBuffer().getWebGPUBuffer() }
                },
                {
                    binding: 1,
                    resource: texture.getWebGPUTextureView()
                },
                {
                    binding: 2,
                    resource: sampler.getWebGPUSampler()
                }
            ]
        };

        let idBindGroupMaterial = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMaterial);
        material.setIdBindGroup(idBindGroupMaterial);

        return idBindGroupMaterial;
    }

    /**
     * Creates a bind group for a buffer. The bind groups is stores in the resource manager, this in the future has to change and
     * each object stores its own bind group.
     * @param {DogObject} dog Dog object contains a buffer to create a bind group for.
     * @param {int} binding The binding to create a bind group for.
     * @param {GPUBindGroupLayout} bindGroupLayout The bind group layout to create a bind group for.
     * @returns {GPUBindGroup} The bind group for the buffer.
     */
    createBGBuffer(dog, binding, bindGroupLayout) {
        const descriptor = {
            label: "Buffer Bind Group",
            layout: bindGroupLayout,
            entries: [
                {
                    binding: binding,
                    resource: { buffer: dog.getBuffer().getWebGPUBuffer() }
                }
            ]
        };

        const idBindGroup = webGPUengine.createBindGroup(resourceManager.getCounter(), descriptor);

        dog.setIdBindGroup(idBindGroup);

        return idBindGroup;
    }

    async createDynamicLights() {
        this.kMaxNumLights = 1024;
        const lightExtentMin = [-1300, 0, -450];
        const lightExtentMax = [1300, 1300, 450];

        // Lights data are uploaded in a storage buffer
        // which could be updated/culled/etc. with a compute shader
        const extent = glMatrix.vec3.create();
        glMatrix.vec3.sub(extent, lightExtentMax, lightExtentMin);
        const lightDataStride = 8;
        const bufferSizeInByte = Float32Array.BYTES_PER_ELEMENT * lightDataStride * this.kMaxNumLights;
        const lightsBuffer = pGraphics.device.createBuffer({
            label: 'lights storage',
            size: bufferSizeInByte,
            usage: GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
        });

        // We randomaly populate lights randomly in a box range
        // And simply move them along y-axis per frame to show they are
        // dynamic lightings
        const lightData = new Float32Array(lightsBuffer.getMappedRange());
        const tmpVec4 = glMatrix.vec4.create();
        let offset = 0;

        for (let i = 0; i < this.kMaxNumLights; i++) {
            offset = lightDataStride * i;
            // position
            for (let i = 0; i < 3; i++) {
                tmpVec4[i] = Math.random() * extent[i] + lightExtentMin[i];
            }

            console.log("t = " + tmpVec4);

            tmpVec4[3] = 1;
            lightData.set(tmpVec4, offset);

            // color
            tmpVec4[0] = Math.random() * 2;
            tmpVec4[1] = Math.random() * 2;
            tmpVec4[2] = Math.random() * 2;

            // radius
            tmpVec4[3] = 300.0;
            lightData.set(tmpVec4, offset + 4);
        }

        lightsBuffer.unmap();

        const lightExtentBuffer = pGraphics.device.createBuffer({
            label: 'light extent uniform',
            size: 4 * 8,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const lightExtentData = new Float32Array(8);
        lightExtentData.set(lightExtentMin, 0);
        lightExtentData.set(lightExtentMax, 4);

        pGraphics.device.queue.writeBuffer(
            lightExtentBuffer,
            0,
            lightExtentData.buffer,
            lightExtentData.byteOffset,
            lightExtentData.byteLength
        );

        const lightsUpdateShader = await webGPUengine.readFileAsText("shaders/lightsUpdate.wgsl");

        this.lightUpdateComputePipeline = pGraphics.device.createComputePipeline({
            label: 'light update',
            layout: 'auto',
            compute: {
                module: pGraphics.device.createShaderModule({
                    code: lightsUpdateShader,
                }),
            }
        });

        this.lightsBufferBindGroupLayout = pGraphics.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'read-only-storage',
                    },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'uniform',
                    },
                }
            ]
        });

        this.configUniformBuffer = pGraphics.device.createBuffer({
            label: 'config uniform buffer',
            size: Uint32Array.BYTES_PER_ELEMENT,
            //mappedAtCreation: true,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.numLights = 1024;

        pGraphics.device.queue.writeBuffer(this.configUniformBuffer, 0, new Uint32Array([this.numLights]));

        /*new Uint32Array(this.configUniformBuffer.getMappedRange())[0] = this.numLights;
        this.configUniformBuffer.unmap();*/

        this.lightsBufferBindGroup = pGraphics.device.createBindGroup({
            layout: this.lightsBufferBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: lightsBuffer,
                },
                {
                    binding: 1,
                    resource: this.configUniformBuffer,
                }
            ]
        });

        this.lightsBufferComputeBindGroup = pGraphics.device.createBindGroup({
            layout: this.lightUpdateComputePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: lightsBuffer,
                },
                {
                    binding: 1,
                    resource: this.configUniformBuffer,
                },
                {
                    binding: 2,
                    resource: lightExtentBuffer,
                }
            ]
        });
    }

    //-------------------------------- Tweakpane UI ------------------------------------------
    /**
     * Creates the UI of the scene
     */
    async createUI() {
        const { Pane } = await import('tweakpane');

        this.directionalLightState = {
            color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
            direction: { x: 1.0, y: -1.0, z: -1.0 },
            enabled: true,
            intensity: 1.0
        };

        this.pointLightsState = {
            enabled: true,
            numLights: 1024,
            radius: 70.0
        };

        const paneLights = new Pane({ container: document.getElementById('ui-lights'), title: '💡 Lights' });
        const directionalLightFolder = paneLights.addFolder({
            title: 'Directional Light',
            expanded: true,   // optional
        });

        directionalLightFolder.addBinding(this.directionalLightState, 'color', { color: { type: 'float' } }).on('change', this.emitUI);
        directionalLightFolder.addBinding(this.directionalLightState, 'direction', { vector: { type: 'float' } }).on('change', this.emitUI);
        directionalLightFolder.addBinding(this.directionalLightState, 'enabled', { label: 'Enabled' }).on('change', this.emitUI);
        directionalLightFolder.addBinding(this.directionalLightState, 'intensity', { label: 'Intensity', min: 0, max: 100, step: 0.1 }).on('change', this.emitUI);

        const pointLightsFolder = paneLights.addFolder({
            title: 'Point Lights',
            expanded: true,   // optional
        });

        pointLightsFolder.addBinding(this.pointLightsState, 'enabled', { label: 'Enabled' }).on('change', this.emitUI);
        pointLightsFolder.addBinding(this.pointLightsState, 'numLights', { label: 'Num Lights', min: 0, max: 1024, step: 1 }).on('change', this.emitUI);
        //pointLightsFolder.addBinding(this.pointLightsState, 'radius', { label: 'Radius', min: 0, max: 400, step: 0.1 }).on('change', this.emitUI);
    }

    /**
     * Emits the UI data
     */
    emitUI() {
        window.dispatchEvent(new CustomEvent(EVT_UI, { detail: this.directionalLightState }));
        window.dispatchEvent(new CustomEvent(EVT_UI, { detail: this.pointLightsState }));
    }
}