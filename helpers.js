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
                resource: texture.getGPUTextureView()
            },
            {
                binding: 2,
                resource: sampler.getGPUSampler()
            }
        ]
    };

    let idBindGroupMaterial = webGPUengine.createBindGroup(resourceManager.getCounter(), jsonMaterial);
    material.setIdBindGroup(idBindGroupMaterial);

    return idBindGroupMaterial;
}