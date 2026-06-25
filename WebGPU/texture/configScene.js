const groupLayouts = [
    [{ 
        name: "DogCamera", 
        label:"Camera", 
        group: 0, 
        binding: 0, 
        bufferSize: 16 * 4 * 2, 
        visibility: GPUVisibility.Vertex | GPUVisibility.Fragment 
    }], // 2 matrices: view and projection
    [
        { 
            name: "DogDirectionalLight", 
            label: "Directional Light", 
            group: 1,
            binding: 0, 
            bufferSize: 16 * 4, 
            visibility: GPUVisibility.Fragment | GPUVisibility.Vertex 
        },
        { 
            name: "DogPointLight", 
            label: "Point Light", 
            group: 1, 
            binding: 1, 
            bufferSize: 16 * 4, 
            visibility: GPUVisibility.Fragment | GPUVisibility.Vertex 
        },
        { 
            name: "DogSpotLight", 
            label: "Spot Light", 
            group: 1, 
            binding: 2, 
            bufferSize: 24 * 4, 
            visibility: GPUVisibility.Fragment | GPUVisibility.Vertex 
        }
    ],
    [
        { 
            name: "DogMaterial", 
            label: "Material", 
            group: 2, 
            binding: 0, 
            bufferSize: 24 * 4, 
            visibility: GPUVisibility.Fragment | GPUVisibility.Vertex 
        }
    ],
    [{ 
        name: "DogTransform", 
        label: "Transform", 
        group: 3, 
        binding: 0, 
        bufferSize: 16 * 4, 
        visibility: GPUVisibility.Vertex | GPUVisibility.Fragment 
    }]
];