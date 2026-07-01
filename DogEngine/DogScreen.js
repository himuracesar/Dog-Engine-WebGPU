/**
 * This component is very useful to debug. In the screen you can render a texture in this way
 * we can check render techniques that have more than one step.
 * 
 * @author César Himura
 * @version 1.0
 */
class DogScreen {
    constructor(name, width, height) {
        this.position = [0.0, 0.0, 0.0];
        this.mModel = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.mModel, this.mModel, this.position);

        this.mOrtho = glMatrix.mat4.create();
        //left, right, bottom, top (inverted), near, far
        glMatrix.mat4.ortho(this.mOrtho, 0, canvas.width, canvas.height, 0, -1, 1);

        this.textureView = null;
        this.visible = true;

        const x1 = 0.0;
        const x2 = width;
        const y1 = 0.0;
        const y2 = height;

        const data = new Float32Array([
            x1, y1, 0.0, 0.0, 0.0,
            x1, y2, 0.0, 0.0, 1.0,
            x2, y1, 0.0, 1.0, 0.0,
            x2, y1, 0.0, 1.0, 0.0,
            x1, y2, 0.0, 0.0, 1.0,
            x2, y2, 0.0, 1.0, 1.0
        ]);

        this.vb = webGPUengine.createDogBuffer(name, BufferType.Vertex, data, 0, false);
        this.cameraBuffer = webGPUengine.createDogBuffer("Camera Buffer", BufferType.Data, null, 64, false);
        this.transformBuffer = webGPUengine.createDogBuffer("Transform Buffer", BufferType.Data, null, 64, false);
        this.sampler = pGraphics.device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

        this.bindGroups = [];
        this.bindGroupLayouts = [];
        this.createBindGroupLayouts();
        this.pipeline = new ScreenPipeline(this.bindGroupLayouts);

        //----------------------- Bind Groups -----------------------//
        const bg0 = {
            label: "Bind Group Camera",
            layout: this.bindGroupLayouts[0],
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.cameraBuffer.getWebGPUBuffer() }
                }
            ]
        };

        const bg3 = {
            label: "Bind Group Transform",
            layout: this.bindGroupLayouts[3],
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.transformBuffer.getWebGPUBuffer() }
                }
            ]
        };

        const jsonBg = [bg0, undefined, undefined, bg3];

        for (let i = 0; i < jsonBg.length; i++) {
            if (jsonBg[i] === undefined) {
                this.bindGroups.push(undefined);
            } else {
                this.bindGroups.push(this.createBindGroup(jsonBg[i]));
            }
        }
    }

    /**
     * Creates the bind group layouts for the screen.
     */
    createBindGroupLayouts() {
        const bgl0 = [{
            binding: 0,
            visibility: GPUVisibility.Vertex,
            buffer: { type: "uniform" }
        }];

        const bgl2 = [{
            binding: 0,
            visibility: GPUVisibility.Fragment,
            texture: {
                sampleType: "float",
                viewDimension: "2d"
            }
        },
        {
            binding: 1,
            visibility: GPUVisibility.Fragment,
            sampler: {
                type: "filtering"
            }
        }];

        const bgl3 = [{
            binding: 0,
            visibility: GPUVisibility.Vertex,
            buffer: { type: "uniform" }
        }]

        this.bindGroupLayouts = [
            pGraphics.device.createBindGroupLayout({ label: "Screen Debug - Camera", entries: bgl0 }),
            undefined,
            pGraphics.device.createBindGroupLayout({ label: "Screen Debug - Texture", entries: bgl2 }),
            pGraphics.device.createBindGroupLayout({ label: "Screen Debug - Transform", entries: bgl3 })
        ];
    }

    /**
     * Creates a bind group from a JSON object.
     * @param {GPUBindGroupDescriptor} jsonObj 
     * @returns {GPUBindGroup} Bind group for the screen.
     */
    createBindGroup(jsonObj) {
        const bindGroup = pGraphics.device.createBindGroup(jsonObj);
        return bindGroup;
    }

    /**
     * Update all the logic values.
     */
    update() {
        if (!this.visible)
            return;

        this.mModel = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.mModel, this.mModel, this.position);
    }

    /**
     * Draw the screen in the HTML canvas.
     */
    render(pass) {
        if (!this.visible)
            return;

        pGraphics.device.queue.writeBuffer(this.cameraBuffer.getWebGPUBuffer(), 0, this.mOrtho);
        pGraphics.device.queue.writeBuffer(this.transformBuffer.getWebGPUBuffer(), 0, this.mModel);

        pass.setPipeline(this.pipeline.getWebGPUPipeline());
        pass.setVertexBuffer(0, this.vb.getWebGPUBuffer());

        for (let i = 0; i < this.bindGroups.length; i++) {
            if (this.bindGroups[i] !== undefined)
                pass.setBindGroup(i, this.bindGroups[i]);
        }

        pass.draw(6, 1, 0, 0);
    }

    /**
     * Set the position for the screen.
     * @param {Vector3} position 
     */
    setPosition(position) {
        this.position = position;
    }

    /**
     * Set a texture to render in the screen. When sets the textures the bind group is created.
     * @param {GPUTextureView} textureView Texture object of the engine.
     */
    setTexture(textureView) {
        this.textureView = textureView;

        const bindGroup = {
            label: "Bind Group Texture",
            layout: this.bindGroupLayouts[2],
            entries: [
                {
                    binding: 0,
                    resource: this.textureView
                },
                {
                    binding: 1,
                    resource: this.sampler
                }
            ]
        };

        this.bindGroups[2] = this.createBindGroup(bindGroup);
    }

    /**
     * Set if the component is visible (true) or not (false)
     * @param {boolean} v Component visible
     */
    setVisible(v) {
        this.visible = v;
    }

    /**
     * Get if the component is visible (true) or not (false)
     * @returns {bool} Component visible
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Get the position of the screen.
     * @returns {Vector3} position
     */
    getPosition() {
        return this.position;
    }
}