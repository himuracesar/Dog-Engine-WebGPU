struct Camera {
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>
};

struct Model {
    modelMatrix : mat4x4<f32>
};

fn inverseMat4x4(m: mat4x4<f32>) -> mat4x4<f32> {
    let n00 = m[0][0]; let n01 = m[0][1]; let n02 = m[0][2]; let n03 = m[0][3];
    let n10 = m[1][0]; let n11 = m[1][1]; let n12 = m[1][2]; let n13 = m[1][3];
    let n20 = m[2][0]; let n21 = m[2][1]; let n22 = m[2][2]; let n23 = m[2][3];
    let n30 = m[3][0]; let n31 = m[3][1]; let n32 = m[3][2]; let n33 = m[3][3];

    let t0 = n22 * n33 - n23 * n32;
    let t1 = n21 * n33 - n23 * n31;
    let t2 = n21 * n32 - n22 * n31;
    let t3 = n20 * n33 - n23 * n30;
    let t4 = n20 * n32 - n22 * n30;
    let t5 = n20 * n31 - n21 * n30;

    let c00 =  (n11 * t0 - n12 * t1 + n13 * t2);
    let c01 = -(n10 * t0 - n12 * t3 + n13 * t4);
    let c02 =  (n10 * t1 - n11 * t3 + n13 * t5);
    let c03 = -(n10 * t2 - n11 * t4 + n12 * t5);

    let det = n00 * c00 + n01 * c01 + n02 * c02 + n03 * c03;
    let invDet = 1.0 / det;

    let d00 = c00 * invDet;
    let d01 = c01 * invDet;
    let d02 = c02 * invDet;
    let d03 = c03 * invDet;

    let d10 = -(n01 * t0 - n02 * t1 + n03 * t2) * invDet;
    let d11 =  (n00 * t0 - n02 * t3 + n03 * t4) * invDet;
    let d12 = -(n00 * t1 - n01 * t3 + n03 * t5) * invDet;
    let d13 =  (n00 * t2 - n01 * t4 + n02 * t5) * invDet;

    let t6 = n12 * n33 - n13 * n32;
    let t7 = n11 * n33 - n13 * n31;
    let t8 = n11 * n32 - n12 * n31;
    let t9 = n10 * n33 - n13 * n30;
    let t10 = n10 * n32 - n12 * n30;
    let t11 = n10 * n31 - n11 * n30;

    let d20 =  (n01 * t6 - n02 * t7 + n03 * t8) * invDet;
    let d21 = -(n00 * t6 - n02 * t9 + n03 * t10) * invDet;
    let d22 =  (n00 * t7 - n01 * t9 + n03 * t11) * invDet;
    let d23 = -(n00 * t8 - n01 * t10 + n02 * t11) * invDet;

    let t12 = n12 * n23 - n13 * n22;
    let t13 = n11 * n23 - n13 * n21;
    let t14 = n11 * n22 - n12 * n21;
    let t15 = n10 * n23 - n13 * n20;
    let t16 = n10 * n22 - n12 * n20;
    let t17 = n10 * n21 - n11 * n20;

    let d30 = -(n01 * t12 - n02 * t13 + n03 * t14) * invDet;
    let d31 =  (n00 * t12 - n02 * t15 + n03 * t16) * invDet;
    let d32 = -(n00 * t13 - n01 * t15 + n03 * t17) * invDet;
    let d33 =  (n00 * t14 - n01 * t16 + n02 * t17) * invDet;

    return mat4x4<f32>(
        vec4<f32>(d00, d10, d20, d30),
        vec4<f32>(d01, d11, d21, d31),
        vec4<f32>(d02, d12, d22, d32),
        vec4<f32>(d03, d13, d23, d33)
    );
}
