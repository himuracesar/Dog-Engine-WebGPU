
/**
 * WireframePipeline is a simple pipeline that renders a mesh as a wireframe. 
 * It uses a vertex shader to transform the vertex positions and a fragment shader to output the wireframe color.
 * 
 * @author César Himura
 * @version 1.0
 */
class WireframePipeline extends DogPipeline {
    /**
     * Creates a new WireframePipeline instance.
     * @param {GPUBindGroupLayout[]} bindGroupLayouts List of bind group layouts to be used in the pipeline. 
     * The first layout should be for the camera uniform buffer,
     */
    constructor(bindGroupLayouts = []) {
        const shader =  `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(1) Normal : vec3<f32>,
                @location(2) TexCoord : vec2<f32>,
            };

            struct Camera {
                viewMatrix : mat4x4<f32>,
                projectionMatrix : mat4x4<f32>,
            };

            struct Model {
                modelMatrix : mat4x4<f32>
                //color : vec4<f32>
            };

            struct Props {
                color : vec4<f32>
            };

            @group(0) @binding(0)
            var<uniform> camera: Camera;

            @group(3) @binding(0)
            var<uniform> model: Model;

            @group(2) @binding(0)
            var<uniform> props: Props;

            @vertex
            fn vertexMain(@location(0) position: vec3f, @location(1) normal: vec3f, @location(2) texCoord: vec2f) -> 
            VertexOutput {
                var output: VertexOutput;

                output.Position = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4f(position, 1.0);

                var normalWorld = model.modelMatrix * vec4f(normal, 0.0);
                output.Normal = normalWorld.xyz;

                output.TexCoord = texCoord;

                return output;
            }

            @fragment
            fn fragmentMain(@location(1) normal: vec3f, @location(2) texCoord: vec2f) -> @location(0) vec4f {
                return props.color;
            }
        `;

        let vertexLayout = { "position" : 3, "normal" : 3, "texCoord" : 2 };

        var descriptor = {
            vertexLayout: vertexLayout,
            bindGroupLayouts: bindGroupLayouts,
            topology: TopologyMode.LineList,
            frontFace: FrontFaceMode.Ccw,
            cullMode: CullMode.None
        };

        super("Wireframe", shader, descriptor);
    }
}