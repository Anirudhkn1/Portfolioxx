import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { asset } from "../lib/asset";
import { rng, sampleAMark } from "../lib/aMark";

/*
  Dotted skull built from the Blender model (tools/blender/skull.py → public/models/skull.glb).
  Every point carries: surface position, normal, baked AO, 4 randoms and an A-sigil target.
  A parent can drive it through a plain mutable `controls` object (GSAP tweens it):
    assemble 0→1  vortex of dots → skull        morph 0→1  skull → A sigil
    explode  0→1  blow apart                     glitch 0→1 slice tear
    stripe   0→1  white scan bands on the dome   tint 0→1   colour → tintColor
    opacity, zoom (0 = rest, 0.8 = deep push-in), camY, spin (extra y rotation, radians)
*/

let geoPromise = null;
function loadGeometry() {
  if (!geoPromise) {
    geoPromise = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        asset("models/skull.glb"),
        (gltf) => {
          let mesh = null;
          gltf.scene.traverse((o) => {
            if (o.isMesh && !mesh) mesh = o;
          });
          mesh.updateMatrixWorld(true);
          let geo = mesh.geometry.clone();
          geo.applyMatrix4(mesh.matrixWorld);
          if (geo.index) geo = geo.toNonIndexed();
          resolve(geo);
        },
        undefined,
        reject,
      );
    });
  }
  return geoPromise;
}

const clouds = new Map();
async function getCloud(count) {
  if (clouds.has(count)) return clouds.get(count);
  const geo = await loadGeometry();
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo));
  const r = rng(1337);
  sampler.setRandomGenerator(r);
  sampler.build();
  const hasColor = !!geo.getAttribute("color");
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const ao = new Float32Array(count);
  const rnd = new Float32Array(count * 4);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    sampler.sample(p, n, hasColor ? c : undefined);
    pos.set([p.x, p.y, p.z], i * 3);
    nor.set([n.x, n.y, n.z], i * 3);
    ao[i] = hasColor ? c.r : 1;
    rnd.set([r(), r(), r(), r()], i * 4);
  }
  const cloud = { pos, nor, ao, rnd, target: sampleAMark(count) };
  clouds.set(count, cloud);
  return cloud;
}
export const preloadSkull = () => loadGeometry();

const VERT = /* glsl */ `
uniform float uTime, uAssemble, uMorph, uExplode, uGlitch, uStripe, uSize, uScale;
attribute vec3 aNormal;
attribute float aAO;
attribute vec4 aRand;
attribute vec3 aTarget;
varying float vB;
varying float vHot;

float h1(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec3 p = position;

  // start state: a tilted orbit ring of dots
  float ang = aRand.x * 6.28318 + uTime * (0.25 + aRand.y * 0.55);
  float rad = 1.9 + aRand.w * 3.4;
  vec3 vort = vec3(cos(ang) * rad, (aRand.y - 0.5) * 1.1 + sin(ang * 2.0 + aRand.z * 6.0) * 0.22, sin(ang) * rad);
  vort.yz = mat2(0.94, -0.34, 0.34, 0.94) * vort.yz;

  // assemble top-down with a little scatter
  float delay = (1.0 - (p.y + 1.0) * 0.5) * 0.5 + aRand.z * 0.35;
  float la = clamp(uAssemble * 1.85 - delay, 0.0, 1.0);
  la = la * la * (3.0 - 2.0 * la);
  vec3 pos = mix(vort, p, la);

  // morph into the A sigil, with a curl in mid-flight
  float lm = clamp(uMorph * 1.7 - aRand.y * 0.7, 0.0, 1.0);
  lm = lm * lm * (3.0 - 2.0 * lm);
  pos = mix(pos, aTarget, lm) + (aNormal * 0.9 + (aRand.xyz - 0.5) * 1.6) * sin(lm * 3.14159) * 0.7;

  // explode outward
  pos += (aNormal * 2.2 + (aRand.xyz - 0.5) * 4.0) * uExplode * (0.6 + aRand.w);

  // faint breathing
  pos += aNormal * sin(uTime * 2.0 + aRand.x * 20.0) * 0.006;

  // slice glitch: whole horizontal bands jump sideways, quantized in time
  float tq = floor(uTime * 15.0);
  float band = floor(pos.y * 9.0);
  float g = h1(band * 17.13 + tq * 3.7);
  float on = step(1.0 - 0.5 * uGlitch, g) * step(0.001, uGlitch);
  pos.x += (h1(band * 7.7 + tq) * 2.0 - 1.0) * on * 0.6 * uGlitch;
  vHot = on;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // halftone lighting: key from upper-left-front, AO crushes sockets to black
  vec3 n = normalize(normalMatrix * aNormal);
  float lam = max(dot(n, normalize(vec3(-0.35, 0.55, 0.85))), 0.0);
  float ao = smoothstep(0.3, 0.97, aAO);
  float b = (0.1 + 0.9 * pow(lam, 1.4)) * ao * 1.15;
  float formed = la * (1.0 - lm) * (1.0 - min(uExplode, 1.0));
  b *= mix(1.0, smoothstep(-0.05, 0.3, n.z), formed);       // back-face cull → reads solid

  // scan stripes across the dome
  float sb = step(0.5, fract(p.y * 5.2 + 0.25)) * smoothstep(0.02, 0.22, p.y) * uStripe * formed;
  b = mix(b, 1.25, sb);

  b = mix(0.5 + aRand.w * 0.5, b, la);   // loose dots are evenly bright
  b = mix(b, 1.0, lm);                    // the sigil is solid
  vB = b;

  float sz = uSize * (0.3 + 1.1 * b) * (1.0 + sb * 0.7);
  gl_PointSize = sz * uScale * (6.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor, uAccent, uTintColor;
uniform float uTint, uOpacity;
varying float vB;
varying float vHot;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = 1.0 - smoothstep(0.3, 0.5, d);
  vec3 col = mix(uColor, uTintColor, uTint);
  col = mix(col, uAccent, vHot * 0.85);
  gl_FragColor = vec4(col * vB, a * uOpacity);
}
`;

export const makeControls = (o = {}) => ({
  assemble: 1, morph: 0, explode: 0, glitch: 0, stripe: 0, tint: 0, opacity: 1, zoom: 0, camY: 0, spin: 0, ...o,
});

export default function SkullPoints({
  controls,
  count,
  color = "#ececec",
  accent = "#ff2a3a",
  tintColor = "#ff2a3a",
  instances = [{ x: 0, y: 0, z: 0, s: 1, ry: 0 }],
  follow = true,
  autoGlitch = true,
  selfAssemble = true,
  size = 1,
  camZ = 6.4,
  fov = 32,
  className = "",
  style,
  onReady,
}) {
  const wrapRef = useRef(null);
  const ctrlRef = useRef(controls);
  ctrlRef.current = controls;

  useEffect(() => {
    const wrap = wrapRef.current;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const n = count ?? (mobile ? 18000 : 36000);
    const own = makeControls(selfAssemble && !ctrlRef.current ? { assemble: 0 } : {});
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "skull-canvas";
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 50);
    camera.position.set(0, 0, camZ);
    const root = new THREE.Group();
    scene.add(root);

    const uniforms = {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uMorph: { value: 0 },
      uExplode: { value: 0 },
      uGlitch: { value: 0 },
      uStripe: { value: 0 },
      uSize: { value: 3.0 * size },
      uScale: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accent) },
      uTintColor: { value: new THREE.Color(tintColor) },
      uTint: { value: 0 },
      uOpacity: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const pivots = instances.map((ins) => {
      const g = new THREE.Group();
      g.position.set(ins.x || 0, ins.y || 0, ins.z || 0);
      g.scale.setScalar(ins.s || 1);
      g.userData = ins;
      root.add(g);
      return g;
    });

    let geometry = null;
    let born = performance.now();
    getCloud(n).then((cl) => {
      if (disposed) return;
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(cl.pos, 3));
      geometry.setAttribute("aNormal", new THREE.BufferAttribute(cl.nor, 3));
      geometry.setAttribute("aAO", new THREE.BufferAttribute(cl.ao, 1));
      geometry.setAttribute("aRand", new THREE.BufferAttribute(cl.rnd, 4));
      geometry.setAttribute("aTarget", new THREE.BufferAttribute(cl.target, 3));
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
      pivots.forEach((g) => {
        const pts = new THREE.Points(geometry, material);
        pts.frustumCulled = false;
        g.add(pts);
      });
      born = performance.now();
      onReady?.();
    });

    // sizing
    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // portrait: lock the horizontal FOV so the skull's size follows the shorter side
      const f = (fov * Math.PI) / 360;
      camera.fov = w < h ? (Math.atan(Math.tan(f) * (h / w)) * 360) / Math.PI : fov;
      camera.updateProjectionMatrix();
      uniforms.uScale.value = (Math.min(w, h) * dpr) / 900;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // pointer
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => {
      const pt = e.touches ? e.touches[0] : e;
      mouse.x = (pt.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (pt.clientY / window.innerHeight) * 2 - 1;
    };
    if (follow) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("touchmove", onMove, { passive: true });
    }

    // visibility
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(wrap);

    let lastNow = performance.now();
    let elapsed = 0;
    let burst = 0;
    let nextBurst = 1.5 + Math.random() * 2;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const now = performance.now();
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;
      elapsed += dt;
      const t = elapsed;
      const c = ctrlRef.current || own;
      // self-assembly runs on wall-clock time, so slow GPUs still finish in ~2.6s
      if (!ctrlRef.current && selfAssemble && own.assemble < 1) own.assemble = Math.min(1, (performance.now() - born) / 2600);

      if (autoGlitch) {
        if (t > nextBurst) {
          burst = 0.55 + Math.random() * 0.45;
          nextBurst = t + 2.2 + Math.random() * 4.5;
        }
        burst = Math.max(0, burst - dt * 3.2);
      }

      mouse.sx += (mouse.x - mouse.sx) * 0.06;
      mouse.sy += (mouse.y - mouse.sy) * 0.06;
      const keep = 1 - Math.min(1, c.morph);
      pivots.forEach((g, i) => {
        const ins = g.userData;
        g.rotation.y = ((ins.ry || 0) + mouse.sx * 0.6 + Math.sin(t * 0.4 + i) * 0.12) * keep + (c.spin || 0);
        g.rotation.x = (mouse.sy * 0.28 + Math.sin(t * 0.3 + i * 2) * 0.05) * keep;
        if (ins.bob) g.position.y = (ins.y || 0) + Math.sin(t * 0.8 + i) * ins.bob;
      });

      uniforms.uTime.value = t;
      uniforms.uAssemble.value = c.assemble;
      uniforms.uMorph.value = c.morph;
      uniforms.uExplode.value = c.explode;
      uniforms.uGlitch.value = Math.min(1, Math.max(c.glitch, burst));
      uniforms.uStripe.value = c.stripe;
      uniforms.uTint.value = c.tint;
      uniforms.uOpacity.value = c.opacity;
      camera.position.z = camZ * (1 - Math.min(c.zoom || 0, 0.92));
      camera.position.y = c.camY || 0;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onMove);
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
    };
    // instances/colours are set once per mount on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={wrapRef} className={"skull-wrap " + className} style={style} aria-hidden="true" />;
}
