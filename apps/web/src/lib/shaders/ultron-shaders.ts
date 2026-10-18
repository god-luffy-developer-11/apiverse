export const UltronShaders = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColorCore;
    uniform vec3 uColorCrack;
    uniform vec3 uColorEnergy;
    uniform float uIntensity;
    uniform float uState; // 0=idle, 1=listening, 2=thinking, 3=streaming, 4=error, 5=success

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Simplex Noise 2D
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      
      // Gravitational lensing towards mouse cursor
      vec2 mouseDir = uMouse - uv;
      float mouseDist = length(mouseDir);
      uv += normalize(mouseDir) * (0.08 / (mouseDist + 0.2));

      float dist = length(uv);
      
      // Event Horizon core darkness
      float eventHorizon = smoothstep(0.42, 0.48, dist);

      // Fracture noise (cracks in the singularity)
      float noiseSpeed = uTime * 0.4;
      if (uState == 2.0) noiseSpeed *= 2.5; // Fast orbit during thinking
      if (uState == 3.0) noiseSpeed *= 1.8; // Streaming rhythm

      float crackNoise = snoise(uv * 4.0 + vec2(noiseSpeed, -noiseSpeed * 0.5));
      float crackLines = abs(crackNoise);
      float crackIntensity = smoothstep(0.12, 0.0, crackLines) * uIntensity;

      // Glow color selection based on state
      vec3 activeCrackColor = uColorCrack;
      if (uState == 4.0) activeCrackColor = vec3(1.0, 0.1, 0.1); // Error flash red
      if (uState == 5.0) activeCrackColor = vec3(0.1, 1.0, 0.6); // Success green

      // Accretion disk swirl
      float angle = atan(uv.y, uv.x);
      float swirl = sin(angle * 6.0 + uTime * 2.0 - dist * 8.0);
      float diskGlow = smoothstep(0.7, 0.45, dist) * smoothstep(0.35, 0.5, dist) * (swirl * 0.5 + 0.5);

      // Composite color
      vec3 color = mix(uColorCore, activeCrackColor, crackIntensity);
      color += uColorEnergy * diskGlow * 1.5;
      
      // Rim Fresnel
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      color += uColorEnergy * fresnel * 0.8;

      gl_FragColor = vec4(color * eventHorizon, 1.0);
    }
  `
};
