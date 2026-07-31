function createBGMateralTexSamp(material, texture, sampler) {
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

function createBGLForShadows() {
    const bglShadows = pGraphics.device.createBindGroupLayout({
        label: "BindGroupLayout Shadows",
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            },
            {
                binding: 2,
                visibility: GPUVisibility.Fragment,
                texture: {
                    sampleType: 'depth',
                }
            },
            {
                binding: 3,
                visibility: GPUVisibility.Fragment,
                sampler: {
                    type: 'comparison'
                }
            }
        ]
    });

    return bglShadows;
}

function createBGForShadows(lightBuffer, lightDataBuffer, shadowMap, shadowSampler) {
    const jsonLight = {
        label: "Shadow Bind Group",
        layout: resourceManager.getBindGroupLayout(1),
        entries: [
            {
                binding: 0,
                resource: { buffer: lightBuffer.getWebGPUBuffer() }
            },
            {
                binding: 1,
                resource: { buffer: lightDataBuffer.getWebGPUBuffer() }
            },
            {
                binding: 2,
                resource: shadowMap.getWebGPUTextureView()
            },
            {
                binding: 3,
                resource: shadowSampler.getWebGPUSampler()
            }
        ]
    };

    let idBindGroupLight = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonLight);

    return idBindGroupLight;
}