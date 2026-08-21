class Scene01 extends DogScene {
    constructor() {
        super();
    }

    async init() {
        console.log("Scene01");
    }

    update(deltaTime) {

    }

    render() {
        const encoder = pGraphics.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: pGraphics.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
                storeOp: "store",
            }],

            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0, // 1.0 is the farthest point
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        });

        pGraphics.device.queue.writeBuffer(camera.getBuffer().getWebGPUBuffer(), 0, camera.getViewMatrix());
        pGraphics.device.queue.writeBuffer(camera.getBuffer().getWebGPUBuffer(), 16 * 4, camera.getProjectionMatrix());

        pass.end();

        const commandBuffer = encoder.finish();

        // Finish the command buffer and immediately submit it.
        pGraphics.device.queue.submit([commandBuffer]);
        //console.log("Frame rendered");
    }
}