
/**
 * ColorPipeline is a simple pipeline that renders colored vertices. 
 * It uses a vertex shader to transform the vertex positions and pass the color to the fragment shader, 
 * which then outputs the final color of each pixel.
 * 
 * @author César Himura
 * @version 1.0
 */
class ColorPipeline extends DogPipeline {
    /**
     * Creates a new ColorPipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline. 
     * The first layout should be for the camera uniform buffer,
     */
    constructor(bindGroupLayouts = []) {
        const shader =  `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(1) color : vec4<f32>,
            };

            struct Camera {
                viewMatrix : mat4x4<f32>,
                projectionMatrix : mat4x4<f32>,
            };

            struct Uniforms {
                modelMatrix : mat4x4<f32>,
            };

            @group(0) @binding(0)
            var<uniform> camera: Camera;

            @group(1) @binding(0)
            var<uniform> uniforms: Uniforms;

            @vertex
            fn vertexMain(@location(0) pos: vec3f, @location(1) color: vec4f) -> 
            VertexOutput {
                var output: VertexOutput;
                output.Position = camera.projectionMatrix * camera.viewMatrix * uniforms.modelMatrix * vec4f(pos, 1.0);
                output.color = color;
                return output;
            }

            @fragment
            fn fragmentMain(@location(1) color: vec4f) -> @location(0) vec4f {
                return color;
            }
        `;

        let vertexLayout = { "position" : 3, "color" : 4 };

        super("Color", shader, vertexLayout, bindGroupLayouts);
    }
}